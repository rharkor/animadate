import { randomUUID } from "crypto"
import { z } from "zod"

import {
  changePasswordResponseSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
} from "@/api/me/schemas"
import { resendResetPasswordExpiration, resetPasswordExpiration, rolesAsObject } from "@/constants"
import { bcryptCompare, hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { i18n } from "@/lib/i18n-config"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import rateLimiter from "@/lib/rate-limit"
import { html, plainText, subject } from "@/lib/templates/mail/reset-password"
import { ApiError, ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { logger } from "@animadate/lib"

export const forgotPassword = async ({ input }: apiInputFromSchema<typeof forgotPasswordSchema>) => {
  try {
    const { email } = input
    //? Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    // if (!user) return ApiError("userNotFound", "NOT_FOUND")
    if (!user) {
      logger.debug("User not found")
      return { email }
    }
    if (!user.hasPassword) return ApiError("userDoesNotHaveAPassword", "BAD_REQUEST")

    const resetPassordToken = await prisma.resetPassordToken.findFirst({
      where: {
        identifier: user.id,
      },
    })

    //? Too recent
    if (resetPassordToken && resetPassordToken.createdAt > new Date(Date.now() - resendResetPasswordExpiration)) {
      return ApiError("emailAlreadySentPleaseTryAgainInFewMinutes", "BAD_REQUEST")
    }

    if (resetPassordToken) {
      await prisma.resetPassordToken.delete({
        where: {
          identifier: resetPassordToken.identifier,
        },
      })
    }

    const resetPasswordToken = randomUUID()
    await prisma.resetPassordToken.create({
      data: {
        token: resetPasswordToken,
        expires: new Date(Date.now() + resetPasswordExpiration),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: subject,
      text: plainText(
        user.name ?? email,
        `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetPasswordToken}`,
        user.lastLocale ?? i18n.defaultLocale
      ),
      html: html(
        user.name ?? email,
        `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetPasswordToken}`,
        user.lastLocale ?? i18n.defaultLocale
      ),
    })

    return { email }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const resetPassword = async ({ input }: apiInputFromSchema<typeof resetPasswordSchema>) => {
  try {
    const { token, password } = input
    const resetPassordToken = await prisma.resetPassordToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    })
    if (!resetPassordToken) return ApiError("tokenNotFound", "NOT_FOUND")
    await prisma.resetPassordToken.delete({
      where: {
        identifier: resetPassordToken.identifier,
      },
    })
    if (resetPassordToken.expires < new Date()) return ApiError("tokenExpired", "BAD_REQUEST")

    if (resetPassordToken.user.role === rolesAsObject.admin && env.NEXT_PUBLIC_IS_DEMO === true)
      return ApiError("cannotResetAdminPasswordInDemoMode", "BAD_REQUEST")

    await prisma.user.update({
      where: {
        id: resetPassordToken.user.id,
      },
      data: {
        password: await hash(password, 12),
      },
    })

    const data: z.infer<ReturnType<typeof resetPasswordResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const changePassword = async ({ input, ctx: { session } }: apiInputFromSchema<typeof changePasswordSchema>) => {
  ensureLoggedIn(session)
  try {
    const { currentPassword, newPassword } = input

    //* Rate limit (10 requests per hour)
    const { success } = await rateLimiter(`change-password:${session.user.id}`, 10, 60 * 60)
    if (!success) {
      return ApiError("tooManyAttempts", "TOO_MANY_REQUESTS")
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        password: true,
      },
    })
    if (!user) return ApiError("userNotFound", "NOT_FOUND")
    if (!user.password) return ApiError("userDoesNotHaveAPassword", "BAD_REQUEST")

    const isPasswordValid = await bcryptCompare(currentPassword, user.password)
    if (!isPasswordValid) {
      return ApiError("invalidPassword", "BAD_REQUEST")
    }

    const isCurrentPasswordSameAsNewPassword = await bcryptCompare(newPassword, user.password)
    if (isCurrentPasswordSameAsNewPassword) {
      return ApiError("newPasswordSameAsCurrentPassword", "BAD_REQUEST")
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: await hash(newPassword, 12),
      },
    })

    const data: z.infer<ReturnType<typeof changePasswordResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
