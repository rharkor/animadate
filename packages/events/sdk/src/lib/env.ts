/* eslint-disable no-process-env */
import { config } from "dotenv"
import { z } from "zod"

import { logger } from "@animadate/lib"
import { createEnv } from "@t3-oss/env-core"

config()

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "staging", "preproduction", "production"]).optional(),
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
