import { z } from "zod"

import { getRedisApiKeyExists } from "@/constants/auth"
import { hash } from "@/lib/bcrypt"
import { eventsPrisma } from "@/lib/prisma/events"
import { eventsRedis } from "@/lib/redis"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  deleteApiKeyResponseSchema,
  deleteApiKeySchema,
} from "./schemas"

export const createApiKey = async ({ input }: apiInputFromSchema<typeof createApiKeySchema>) => {
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
    const res: z.infer<ReturnType<typeof createApiKeyResponseSchema>> = {
      apiKeyId: apiKey.id,
      apiKeySecret: key,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteApiKey = async ({ input }: apiInputFromSchema<typeof deleteApiKeySchema>) => {
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
    const res: z.infer<ReturnType<typeof deleteApiKeyResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
