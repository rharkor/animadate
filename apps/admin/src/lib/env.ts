/* eslint-disable no-process-env */
import { config } from "dotenv"
import { z } from "zod"

import { logger } from "@animadate/lib"
import { createEnv } from "@t3-oss/env-nextjs"

if (!process.env.ENV) {
  config()
}

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    PASSWORD_HASHER_SECRET: z.string(),
    APP_DATABASE_PRISMA_URL: z.string().min(1),
    APP_DATABASE_URL_NON_POOLING: z.string().optional(),
    EVENTS_DATABASE_PRISMA_URL: z.string().min(1),
    EVENTS_DATABASE_URL_NON_POOLING: z.string().optional(),
    AUTH_SECRET: z.string(),
    AUTH_URL: z.string().optional(),
    AUTH_TRUST_HOST: z.string().optional(),
    AUTH_ADMIN_EMAIL: z.string().min(1),
    AUTH_ADMIN_PASSWORD: z.string().min(1),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z
      .string()
      .optional()
      .transform((value) => (!!value ? parseInt(value) : undefined)),
    REDIS_USERNAME: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_USE_TLS: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    ENV: z.enum(["development", "staging", "preproduction", "production"]),
    VERCEL_URL: z.string().optional(),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z
      .string()
      .min(1)
      .transform((value) => parseInt(value)),
    SMTP_USERNAME: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_FROM_NAME: z.string().min(1),
    SMTP_FROM_EMAIL: z.string().min(1),
    SUPPORT_EMAIL: z.string().min(1),
    S3_REGION: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    ENABLE_S3_SERVICE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    DISABLE_REGISTRATION: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    EVENTS_API_URL: z.string().url(),
    EVENTS_API_KEY_ID: z.string().min(1),
    EVENTS_API_KEY_SECRET: z.string().min(1),
    DISABLE_EVENTS_PUSH: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    WS_PORT: z.coerce.number(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_IS_DEMO: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    NEXT_PUBLIC_DEMO_EMAIL: z.string().optional(),
    NEXT_PUBLIC_DEMO_PASSWORD: z.string().optional(),
    NEXT_PUBLIC_S3_ENDPOINT: z.string().optional(),
    NEXT_PUBLIC_S3_BUCKET_NAME: z.string().optional(),
    NEXT_PUBLIC_ENABLE_MAILING_SERVICE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    NEXT_PUBLIC_WS_URL: z.string().min(1),
    NEXT_PUBLIC_MAP_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
    APP_DATABASE_PRISMA_URL: process.env.APP_DATABASE_PRISMA_URL,
    APP_DATABASE_URL_NON_POOLING: process.env.APP_DATABASE_URL_NON_POOLING,
    EVENTS_DATABASE_PRISMA_URL: process.env.EVENTS_DATABASE_PRISMA_URL,
    EVENTS_DATABASE_URL_NON_POOLING: process.env.EVENTS_DATABASE_URL_NON_POOLING,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
    AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USE_TLS: process.env.REDIS_USE_TLS,
    NEXT_PUBLIC_IS_DEMO: process.env.NEXT_PUBLIC_IS_DEMO,
    NEXT_PUBLIC_DEMO_EMAIL: process.env.NEXT_PUBLIC_DEMO_EMAIL,
    NEXT_PUBLIC_DEMO_PASSWORD: process.env.NEXT_PUBLIC_DEMO_PASSWORD,
    ENV: process.env.ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    NEXT_PUBLIC_ENABLE_MAILING_SERVICE: process.env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE,
    S3_REGION: process.env.S3_REGION,
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    ENABLE_S3_SERVICE: process.env.ENABLE_S3_SERVICE,
    DISABLE_REGISTRATION: process.env.DISABLE_REGISTRATION,
    EVENTS_API_URL: process.env.EVENTS_API_URL,
    EVENTS_API_KEY_ID: process.env.EVENTS_API_KEY_ID,
    EVENTS_API_KEY_SECRET: process.env.EVENTS_API_KEY_SECRET,
    DISABLE_EVENTS_PUSH: process.env.DISABLE_EVENTS_PUSH,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_MAP_API_KEY: process.env.NEXT_PUBLIC_MAP_API_KEY,
    WS_PORT: process.env.WS_PORT,
  },
  onValidationError: (error) => {
    logger.error(error)
    throw "Invalid environment variables"
  },
  onInvalidAccess(variable) {
    logger.error(`Invalid access to ${variable}`)
    throw "Invalid environment variables"
  },
})
