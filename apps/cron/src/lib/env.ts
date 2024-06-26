/* eslint-disable no-process-env */
import { config } from "dotenv"
import { z } from "zod"

import { logger } from "@animadate/lib"
import { createEnv } from "@t3-oss/env-core"

config()

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "staging", "preproduction", "production"]).optional(),
    APP_DATABASE_PRISMA_URL: z.string().min(1),
    APP_DATABASE_URL_NON_POOLING: z.string().optional(),
    EVENTS_DATABASE_PRISMA_URL: z.string().min(1),
    EVENTS_DATABASE_URL_NON_POOLING: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    ENABLE_S3_SERVICE: z
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
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (error) => {
    logger.error(error)
    throw "Invalid environment variables"
  },
  onInvalidAccess(variable) {
    logger.error(`Invalid access to ${variable}`)
    throw "Invalid environment variables"
  },
})
