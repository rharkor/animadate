import { z } from "zod"

import {
  queriesOptionPage,
  queriesOptionPageDr,
  queriesOptionPerPage,
  queriesOptionPerPageDr,
} from "@/lib/queries-options"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { fileSchemaMinimal } from "@/schemas/file"

import { TDictionary } from "../../lib/langs"
import {
  emailSchema,
  emailSchemaDr,
  nameSchema,
  nameSchemaDr,
  passwordSchemaWithRegex,
  passwordSchemaWithRegexDr,
} from "../auth/schemas"

export const userSchemaDr = dictionaryRequirements(nameSchemaDr)
export const userSchema = (dictionary?: TDictionary<typeof userSchemaDr>) =>
  z.object({
    id: z.string(),
    socialId: z.string(),
    email: z.string(),
    emailVerified: z.date().nullable(),
    profilePicture: fileSchemaMinimal().nullable(),
    name: nameSchema(dictionary),
    role: z.string(),
    hasPassword: z.boolean(),
    otpVerified: z.boolean(),
    lastLocale: z.string().nullable(),
  })

export const updateUserSchemaDr = dictionaryRequirements(nameSchemaDr)
export const updateUserSchema = (dictionary?: TDictionary<typeof updateUserSchemaDr>) =>
  z.object({
    name: nameSchema(dictionary).or(z.literal("")).optional(),
    profilePictureKey: z.string().optional().nullable(),
  })

export const updateUserResponseSchema = () =>
  z.object({
    user: userSchema(),
  })

export const sessionsSchema = () =>
  z.object({
    id: z.string(),
    sessionToken: z.string(),
    userId: z.string(),
    expires: z.coerce.date(),
    ua: z.string(),
    ip: z.string(),
    lastUsedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
  })

export const getActiveSessionsSchemaDr = dictionaryRequirements(queriesOptionPageDr, queriesOptionPerPageDr)
export const getActiveSessionsSchema = (dictionary?: TDictionary<typeof getActiveSessionsSchemaDr>) =>
  z.object({
    page: queriesOptionPage(dictionary),
    perPage: queriesOptionPerPage(dictionary),
  })

export const getActiveSessionsResponseSchema = () =>
  z.object({
    data: z.array(sessionsSchema()).optional(),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  })

export const deleteSessionSchema = () =>
  z.object({
    id: z.string(),
  })

export const deleteSessionResponseSchema = () =>
  z.object({
    id: z.string(),
  })

export const getAccountResponseSchemaDr = dictionaryRequirements(nameSchemaDr)
export const getAccountResponseSchema = (dictionary?: TDictionary<typeof getAccountResponseSchemaDr>) =>
  z.object({
    user: userSchema(dictionary),
  })

export const deleteAccountResponseSchema = () =>
  z.object({
    user: z.object({
      id: z.string(),
    }),
  })

export const forgotPasswordSchemaDr = dictionaryRequirements(emailSchemaDr)
export const forgotPasswordSchema = (dictionary?: TDictionary<typeof forgotPasswordSchemaDr>) =>
  z.object({
    email: emailSchema(dictionary),
  })

export const forgotPasswordResponseSchema = () =>
  z.object({
    email: z.string(),
  })

export const resetPasswordSchemaDr = dictionaryRequirements(
  {
    errors: {
      passwordsDoNotMatch: true,
    },
  },
  passwordSchemaWithRegexDr
)
export const resetPasswordSchema = (dictionary?: TDictionary<typeof resetPasswordSchemaDr>) =>
  z
    .object({
      token: z.string(),
      password: passwordSchemaWithRegex(dictionary),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: dictionary?.errors.passwordsDoNotMatch ?? "Passwords do not match",
      path: ["passwordConfirmation"],
    })

export const resetPasswordResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const sendVerificationEmailSchemaDr = dictionaryRequirements(emailSchemaDr, userSchemaDr)
export const sendVerificationEmailSchema = (dictionary?: TDictionary<typeof sendVerificationEmailSchemaDr>) =>
  z
    .object({
      user: userSchema(dictionary).pick({
        id: true,
        emailVerified: true,
        lastLocale: true,
        email: true,
      }),
      silent: z.boolean().optional(),
      email: z.never().optional(),
    })
    .or(
      z.object({
        email: emailSchema(dictionary),
        silent: z.boolean().optional(),
        user: z.never().optional(),
      })
    )

export const sendVerificationEmailResponseSchema = () =>
  z.object({
    email: z.string(),
  })

export const verifyEmailSchema = () =>
  z.object({
    token: z.string(),
  })

export const verifyEmailResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const signUpResponseSchemaDr = dictionaryRequirements(userSchemaDr)
export const signUpResponseSchema = (dictionary?: TDictionary<typeof signUpResponseSchemaDr>) =>
  z.object({
    user: userSchema(dictionary),
  })

export const needHelpSchemaDr = dictionaryRequirements(
  {
    errors: {
      messageMinLength: true,
    },
  },
  emailSchemaDr,
  nameSchemaDr
)
export const needHelpSchema = (dictionary?: TDictionary<typeof needHelpSchemaDr>) =>
  z.object({
    locale: z.string(),
    name: nameSchema(dictionary),
    email: emailSchema(dictionary),
    message: z.string().min(10, dictionary?.errors.messageMinLength.replace("{size}", "10")),
  })

export const needHelpResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const changeEmailSchemaDr = dictionaryRequirements(emailSchemaDr)
export const changeEmailSchema = (dictionary?: TDictionary<typeof changeEmailSchemaDr>) =>
  z.object({
    email: emailSchema(dictionary),
    password: z.string(),
  })

export const changeEmailResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const validateChangeEmailSchema = () =>
  z.object({
    token: z.string(),
  })

export const validateChangeEmailResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })
