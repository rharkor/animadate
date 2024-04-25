import { z } from "zod"

import { needHelpResponseSchema, needHelpSchema, updateUserResponseSchema, updateUserSchema } from "@/api/me/schemas"
import { rolesAsObject } from "@/constants"
import { env } from "@/lib/env"
import { i18n, Locale } from "@/lib/i18n-config"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import rateLimiter from "@/lib/rate-limit"
import { s3Client } from "@/lib/s3"
import * as needHelpConfirm from "@/lib/templates/mail/need-help-confirm"
import * as needHelpSupport from "@/lib/templates/mail/need-help-support"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { logger } from "@animadate/lib"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"

export const updateUser = async ({ input, ctx: { session } }: apiInputFromSchema<typeof updateUserSchema>) => {
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

    const data: z.infer<ReturnType<typeof updateUserResponseSchema>> = {
      user: updatedUser,
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteAccount = async ({ ctx: { session } }: apiInputFromSchema<undefined>) => {
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

    return { user }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const needHelp = async ({ input, ctx: { session } }: apiInputFromSchema<typeof needHelpSchema>) => {
  ensureLoggedIn(session)
  try {
    const { message, email, name, locale: localeWanted } = input
    //* Rate limit (5 requests per day)
    const { success } = await rateLimiter(`need-help:${session.user.id}`, 5, 60 * 60 * 24)
    if (!success) {
      return ApiError("tooManyRequests", "TOO_MANY_REQUESTS")
    }

    //* Mail to the support
    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: env.SUPPORT_EMAIL,
      subject: needHelpSupport.subject,
      replyTo: email,
      text: needHelpSupport.plainText(message, {
        email,
        name,
        id: session.user.id,
      }),
      html: needHelpSupport.html(message, {
        email,
        name,
        id: session.user.id,
      }),
    })

    //* Mail to the user
    const locale = i18n.locales.includes(localeWanted) ? (localeWanted as Locale) : i18n.defaultLocale
    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: needHelpConfirm.subject,
      text: needHelpConfirm.plainText(locale),
      html: needHelpConfirm.html(locale),
    })

    const data: z.infer<ReturnType<typeof needHelpResponseSchema>> = {
      success: true,
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
