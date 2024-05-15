/* eslint-disable no-process-env */
import { config } from "dotenv"
import { z } from "zod"

import { logger } from "@animadate/lib"
import { createEnv } from "@t3-oss/env-core"

config()

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "staging", "preproduction", "production"]).optional(),
    EVENTS_API_URL: z.string().url(),
    EVENTS_API_KEY_ID: z.string(),
    EVENTS_API_KEY_SECRET: z.string(),
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
