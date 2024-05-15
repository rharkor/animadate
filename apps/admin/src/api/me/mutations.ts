import { z } from "zod"

import { needHelpResponseSchema, needHelpSchema, updateUserResponseSchema, updateUserSchema } from "@/api/me/schemas"
import { rolesAsObject } from "@/constants"
import { logoUrl } from "@/constants/medias"
import { env } from "@/lib/env"
import { i18n, Locale } from "@/lib/i18n-config"
import { _getDictionary } from "@/lib/langs"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import rateLimiter from "@/lib/rate-limit"
import { s3Client } from "@/lib/s3"
import { getContext } from "@/lib/utils/events"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import NeedHelpConfirmationTemplate from "@animadate/emails/emails/need-help-confirmation"
import NeedHelpSupportTemplate from "@animadate/emails/emails/need-help-support"
import events from "@animadate/events-sdk"
import { logger } from "@animadate/lib"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { render } from "@react-email/render"

export const updateUser = async ({ input, ctx: { session, req } }: apiInputFromSchema<typeof updateUserSchema>) => {
  ensureLoggedIn(session)
  try {
    const { name, profilePictureKey } = input

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        profilePicture: true,
      },
    })
    if (!user) {
      return ApiError("userNotFound")
    }

    const getProfilePicture = async (key: string) => {
      const uploadingFile = await prisma.fileUploading.findUnique({
        where: {
          key,
        },
      })
      if (!uploadingFile) {
        return ApiError("fileNotFound")
      }

      return {
        bucket: uploadingFile.bucket,
        endpoint: uploadingFile.endpoint,
        key: uploadingFile.key,
        filetype: uploadingFile.filetype,
        fileUploading: {
          connect: {
            id: uploadingFile.id,
          },
        },
      }
    }

    const profilePicture =
      profilePictureKey === null || profilePictureKey === undefined
        ? profilePictureKey
        : await getProfilePicture(profilePictureKey)

    //* Disconnect old profile picture (when null or set)
    if (profilePictureKey !== undefined && user.profilePicture) {
      await prisma.file.update({
        where: {
          userProfilePictureId: user.id,
        },
        data: {
          userProfilePictureId: null,
        },
      })
    }

    //* Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        profilePicture:
          profilePicture !== undefined && profilePicture !== null
            ? {
                connectOrCreate: {
                  where: { key: profilePicture.key },
                  create: profilePicture,
                },
              }
            : undefined,
      },
      include: {
        profilePicture: true,
      },
    })
    events.push({
      name: "user.updated",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
      data: input,
    })

    const data: z.infer<ReturnType<typeof updateUserResponseSchema>> = {
      user: updatedUser,
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteAccount = async ({ ctx: { session, req } }: apiInputFromSchema<undefined>) => {
  try {
    ensureLoggedIn(session)
    //* Ensure not admin
    if (session.user.role === rolesAsObject.admin) {
      return ApiError("cannotDeleteAdmin", "FORBIDDEN")
    }

    //* If the user has an image and the image is not the same as the new one, delete the old one (s3)
    if (session.user.image && s3Client) {
      const command = new DeleteObjectCommand({
        Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: session.user.image,
      })
      await s3Client.send(command).catch((e) => {
        logger.error(e)
      })
    }

    //* Delete the user
    const user = await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    })
    events.push({
      name: "user.deleted",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
    })

    return { user }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const needHelp = async ({ input, ctx: { session, req } }: apiInputFromSchema<typeof needHelpSchema>) => {
  ensureLoggedIn(session)
  try {
    const { message, email, name, locale: localeWanted } = input
    //* Rate limit (5 requests per day)
    const { success } = await rateLimiter(`need-help:${session.user.id}`, 5, 60 * 60 * 24)
    if (!success) {
      return ApiError("tooManyRequests", "TOO_MANY_REQUESTS")
    }

    //* Mail to the support
    const supportDictionary = await _getDictionary("transactionals", "en", {
      footer: true,
      needHelpRequest: true,
      needSHelp: true,
    })
    const supportElement = NeedHelpSupportTemplate({
      footerText: supportDictionary.footer,
      logoUrl,
      message,
      previewText: supportDictionary.needHelpRequest,
      supportEmail: env.SUPPORT_EMAIL,
      titleText: supportDictionary.needSHelp,
      user: {
        email,
        name,
        id: session.user.id,
      },
    })
    const supportText = render(supportElement, {
      plainText: true,
    })
    const supportHtml = render(supportElement)
    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: env.SUPPORT_EMAIL,
      subject: supportDictionary.needHelpRequest,
      replyTo: email,
      text: supportText,
      html: supportHtml,
    })

    //* Mail to the user
    const locale = i18n.locales.includes(localeWanted) ? (localeWanted as Locale) : i18n.defaultLocale
    const confirmationDictionary = await _getDictionary("transactionals", locale, {
      hey: true,
      messageWillGetBack: true,
      yourRequestHasBeenSent: true,
      footer: true,
    })
    const confirmationElement = NeedHelpConfirmationTemplate({
      contentTitle: confirmationDictionary.messageWillGetBack,
      footerText: confirmationDictionary.footer,
      heyText: confirmationDictionary.hey,
      logoUrl,
      name,
      previewText: confirmationDictionary.yourRequestHasBeenSent,
      supportEmail: env.SUPPORT_EMAIL,
      titleText: confirmationDictionary.yourRequestHasBeenSent,
    })
    const confirmationText = render(confirmationElement, {
      plainText: true,
    })
    const confirmationHtml = render(confirmationElement)

    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: confirmationDictionary.yourRequestHasBeenSent,
      text: confirmationText,
      html: confirmationHtml,
    })
    events.push({
      name: "user.need-help",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
      data: { message, email, name },
    })

    const data: z.infer<ReturnType<typeof needHelpResponseSchema>> = {
      success: true,
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
