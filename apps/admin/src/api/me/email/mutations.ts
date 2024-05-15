import { randomUUID } from "crypto"
import { z } from "zod"

import {
  changeEmailResponseSchema,
  changeEmailSchema,
  sendVerificationEmailSchema,
  validateChangeEmailResponseSchema,
  validateChangeEmailSchema,
  verifyEmailResponseSchema,
  verifyEmailSchema,
} from "@/api/me/schemas"
import { changeEmailTokenExpiration, emailVerificationExpiration, resendEmailVerificationExpiration } from "@/constants"
import { logoUrl } from "@/constants/medias"
import { bcryptCompare } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { i18n, Locale } from "@/lib/i18n-config"
import { _getDictionary } from "@/lib/langs"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import rateLimiter from "@/lib/rate-limit"
import { generateOTP } from "@/lib/utils"
import { getContext } from "@/lib/utils/events"
import { ApiError, ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import ChangeEmailOTPTemplate from "@animadate/emails/emails/change-email-otp"
import VerifyEmail from "@animadate/emails/emails/verify-email"
import events from "@animadate/events-sdk"
import { logger } from "@animadate/lib"
import { render } from "@react-email/render"

export const sendVerificationEmail = async ({
  input,
  ctx: { req },
}: apiInputFromSchema<typeof sendVerificationEmailSchema>) => {
  try {
    const { silent, email: iEmail, user: iUser } = input
    const email = (iUser ? iUser.email?.toLowerCase() : iEmail?.toLowerCase()) ?? ""
    const user = iUser ?? (await prisma.user.findUnique({ where: { email } }))

    const token = randomUUID()

    if (!user) {
      logger.debug("User not found")
      return { email }
    }

    if (user.emailVerified) {
      if (silent) return { email }
      logger.debug("User email already verified")
      return ApiError("emailAlreadyVerified", "BAD_REQUEST")
    }

    const userEmailVerificationToken = await prisma.userEmailVerificationToken.findFirst({
      where: {
        identifier: user.id,
      },
    })
    if (userEmailVerificationToken) {
      //? If silent, return early
      if (silent) return { email }

      const isToRecent = userEmailVerificationToken.createdAt.getTime() + resendEmailVerificationExpiration > Date.now()
      if (isToRecent) {
        if (logger.allowDebug) {
          const availableIn = Math.round(
            (userEmailVerificationToken.createdAt.getTime() + resendEmailVerificationExpiration - Date.now()) / 1000
          )
          logger.debug("Verification email already sent: ", availableIn, "seconds left")
        }
        return ApiError("emailAlreadySentPleaseTryAgainInFewMinutes", "BAD_REQUEST")
      }
      await prisma.userEmailVerificationToken.delete({
        where: {
          identifier: userEmailVerificationToken.identifier,
        },
      })
    }

    if (env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true) {
      await prisma.userEmailVerificationToken.create({
        data: {
          identifier: user.id,
          token: token,
          expires: new Date(Date.now() + emailVerificationExpiration),
        },
      })
      const verificationLink = `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`
      const locale = (user.lastLocale as Locale | null) ?? i18n.defaultLocale
      const dictionary = await _getDictionary("transactionals", locale, {
        hey: true,
        verifyEmail: true,
        footer: true,
        thanksForSigninUpCompleteRegistration: true,
        verifyYourEmailAddress: true,
        verifyYourEmailAddressToCompleteYourRegistration: true,
      })
      const element = VerifyEmail({
        verificationLink,
        actionText: dictionary.verifyEmail,
        contentTitle: dictionary.thanksForSigninUpCompleteRegistration,
        footerText: dictionary.footer,
        heyText: dictionary.hey,
        logoUrl,
        name: user.name,
        previewText: dictionary.verifyYourEmailAddressToCompleteYourRegistration,
        supportEmail: env.SUPPORT_EMAIL,
        titleText: dictionary.verifyYourEmailAddress,
      })
      const text = render(element, {
        plainText: true,
      })
      const html = render(element)

      await sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: email.toLowerCase(),
        subject: dictionary.verifyYourEmailAddress,
        text,
        html,
      })
      events.push({
        name: "user.email.verification.sent",
        kind: "PROFILE",
        level: "INFO",
        context: getContext({ req, session: null }),
        data: { email, silent, token },
      })
    } else {
      logger.debug("Email verification disabled")
      if (silent) return { email }
      return ApiError("emailServiceDisabled", "PRECONDITION_FAILED")
    }

    return { email }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const verifyEmail = async ({ input, ctx: { req } }: apiInputFromSchema<typeof verifyEmailSchema>) => {
  try {
    const { token } = input

    const userEmailVerificationToken = await prisma.userEmailVerificationToken.findUnique({
      where: {
        token: token,
      },
    })
    if (!userEmailVerificationToken) {
      logger.debug("Token not found")
      return ApiError("tokenNotFound", "BAD_REQUEST")
    }

    await prisma.userEmailVerificationToken.delete({
      where: {
        identifier: userEmailVerificationToken.identifier,
      },
    })

    if (userEmailVerificationToken.expires.getTime() < Date.now()) {
      logger.debug("Token expired")
      return ApiError("tokenExpired", "BAD_REQUEST")
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userEmailVerificationToken.identifier,
      },
    })
    if (!user) {
      logger.debug("User not found")
      return ApiError("userNotFound", "BAD_REQUEST")
    }

    if (user.emailVerified) {
      logger.debug("User email already verified")
      return ApiError("emailAlreadyVerified", "BAD_REQUEST")
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    })
    events.push({
      name: "user.email.verification.verified",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session: null }),
      data: { email: user.email, token },
    })

    const data: z.infer<ReturnType<typeof verifyEmailResponseSchema>> = {
      success: true,
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const changeEmail = async ({ input, ctx: { session, req } }: apiInputFromSchema<typeof changeEmailSchema>) => {
  ensureLoggedIn(session)
  try {
    const { email, password } = input

    //* Rate limit (10 requests per hour)
    const { success } = await rateLimiter(`want-change-email:${session.user.id}`, 10, 60 * 60)
    if (!success) {
      return ApiError("tooManyAttempts", "TOO_MANY_REQUESTS")
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        password: true,
        lastLocale: true,
        email: true,
        name: true,
      },
    })
    if (!user) {
      return ApiError("userNotFound", "BAD_REQUEST")
    }

    if (!user.password) {
      return ApiError("userDoesNotHaveAPassword", "BAD_REQUEST")
    }

    const isPasswordValid = await bcryptCompare(password, user.password)
    if (!isPasswordValid) {
      return ApiError("invalidPassword", "BAD_REQUEST")
    }

    if (email === user.email) {
      return ApiError("alreadyYourEmail", "BAD_REQUEST")
    }

    const sameEmailUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (sameEmailUser) {
      return ApiError("emailAlreadyInUse", "BAD_REQUEST")
    }

    // Generate a 6 digit OTP
    const otp = generateOTP(6)
    // Store the OTP in the database
    await prisma.changeEmailToken.upsert({
      where: {
        identifier: session.user.id,
      },
      create: {
        identifier: session.user.id,
        token: otp,
        expires: new Date(Date.now() + changeEmailTokenExpiration), // Expires in 5 minutes
        newEmail: email,
      },
      update: {
        token: otp,
        expires: new Date(Date.now() + changeEmailTokenExpiration), // Expires in 5 minutes
        newEmail: email,
        createdAt: new Date(),
      },
    })

    // Send the OTP to the new email
    if (env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true) {
      const locale = (user.lastLocale as Locale) ?? i18n.defaultLocale
      const mailDict = await _getDictionary("transactionals", locale, {
        footer: true,
        confirmYourNewEmail: true,
        changeEmailAddressDescription: true,
        hey: true,
      })
      const element = ChangeEmailOTPTemplate({
        footerText: mailDict.footer,
        logoUrl,
        heyText: mailDict.hey,
        code: otp,
        contentTitle: mailDict.changeEmailAddressDescription,
        name: user.name,
        previewText: mailDict.confirmYourNewEmail,
        titleText: mailDict.confirmYourNewEmail,
        supportEmail: env.SUPPORT_EMAIL,
      })
      const text = render(element, {
        plainText: true,
      })
      const html = render(element)

      await sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: mailDict.confirmYourNewEmail,
        text,
        html,
      })
    } else {
      logger.debug("Email verification disabled")
      return ApiError("emailServiceDisabled", "PRECONDITION_FAILED")
    }
    events.push({
      name: "user.email.change.requested",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
      data: { email },
    })

    const res: z.infer<ReturnType<typeof changeEmailResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const validateChangeEmail = async ({
  input,
  ctx: { session, req },
}: apiInputFromSchema<typeof validateChangeEmailSchema>) => {
  ensureLoggedIn(session)
  try {
    const { token } = input

    //* Rate limit check token valid (10 requests per hour)
    const { success } = await rateLimiter(`change-email-check-token:${session.user.id}`, 10, 60 * 60)
    if (!success) {
      return ApiError("tooManyAttempts", "TOO_MANY_REQUESTS")
    }

    const changeEmailToken = await prisma.changeEmailToken.findUnique({
      where: {
        identifier: session.user.id,
      },
    })
    if (!changeEmailToken) {
      return ApiError("tokenNotFound", "BAD_REQUEST")
    }

    if (changeEmailToken.expires.getTime() < Date.now()) {
      return ApiError("tokenExpired", "BAD_REQUEST")
    }

    if (changeEmailToken.token !== token) {
      return ApiError("tokenInvalid", "BAD_REQUEST")
    }

    //* Rate limit email changement (3 requests per day)
    const rlChangement = await rateLimiter(`change-email:${session.user.id}`, 3, 60 * 60 * 24)
    if (!rlChangement.success) {
      return ApiError("rateLimitChangeEmail", "TOO_MANY_REQUESTS")
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        email: changeEmailToken.newEmail,
        emailVerified: new Date(),
      },
    })

    await prisma.changeEmailToken.delete({
      where: {
        identifier: session.user.id,
      },
    })

    events.push({
      name: "user.email.changed",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
      data: { email: changeEmailToken.newEmail },
    })

    const res: z.infer<ReturnType<typeof validateChangeEmailResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
