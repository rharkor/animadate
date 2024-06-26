import { z } from "zod"

import { getRedisApiKeyExists } from "@/constants/auth"
import { hash } from "@/lib/bcrypt"
import { eventsPrisma } from "@/lib/prisma/events"
import { eventsRedis } from "@/lib/redis"
import { getContext } from "@/lib/utils/events"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import events from "@animadate/events-sdk"

import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  deleteApiKeyResponseSchema,
  deleteApiKeySchema,
} from "./schemas"

export const createApiKey = async ({ input, ctx: { req, session } }: apiInputFromSchema<typeof createApiKeySchema>) => {
  ensureLoggedIn(session)
  try {
    const { name } = input
    const key = crypto.randomUUID()
    const hashed = await hash(key, 10)
    const apiKey = await eventsPrisma.apiKey.create({
      data: {
        name,
        key: hashed,
      },
    })
    events.push({
      name: "api-keys.created",
      kind: "OTHER",
      level: "INFO",
      context: getContext({ req, session }),
      data: { name },
    })
    const res: z.infer<ReturnType<typeof createApiKeyResponseSchema>> = {
      apiKeyId: apiKey.id,
      apiKeySecret: key,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteApiKey = async ({ input, ctx: { req, session } }: apiInputFromSchema<typeof deleteApiKeySchema>) => {
  ensureLoggedIn(session)
  try {
    const { id } = input
    const key = await eventsPrisma.apiKey.delete({
      where: {
        id,
      },
      select: {
        key: true,
      },
    })
    await eventsRedis.del(getRedisApiKeyExists(key.key))
    events.push({
      name: "api-keys.deleted",
      kind: "OTHER",
      level: "INFO",
      context: getContext({ req, session }),
      data: { id },
    })
    const res: z.infer<ReturnType<typeof deleteApiKeyResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
