import { z } from "zod"

import { getRedisApiKeyLastUsed } from "@/constants/auth"
import { eventsPrisma } from "@/lib/prisma/events"
import { eventsRedis } from "@/lib/redis"
import { ApiError, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { Prisma } from "@animadate/events-db/generated/client"

import { getApiKeysResponseSchema, getApiKeysSchema } from "./schemas"

export const getApiKeys = async ({ input }: apiInputFromSchema<typeof getApiKeysSchema>) => {
  try {
    const { page, perPage, sort } = input

    const skip = (page - 1) * perPage
    const take = perPage

    const orderBy: Prisma.ApiKeyOrderByWithRelationInput[] = await Promise.all(
      sort.map(async (s) => {
        const { direction, field } = s
        const allowedFields = ["name", "lastUsedAt", "createdAt"]
        if (!allowedFields.includes(field)) {
          await ApiError("invalidSortField")
        }
        if (field === "lastUsedAt") {
          return {}
        }
        return {
          [field]: direction,
        }
      })
    )
    const apiKeys = await eventsPrisma.apiKey.findMany({
      skip,
      take,
      orderBy,
    })
    const total = await eventsPrisma.apiKey.count()

    // Fill apiKeys with lastUsedAt
    const keys = apiKeys.map((k) => k.id)
    const lastUsedAts = keys.length > 0 ? await eventsRedis.mget(keys.map(getRedisApiKeyLastUsed)) : []
    const apiKeysWithLastUsed = apiKeys.map((k, i) => ({
      ...k,
      lastUsedAt: lastUsedAts[i] ? new Date(parseInt(lastUsedAts[i] as string)) : null,
    }))

    // Apply sort for lastUsedAt
    apiKeysWithLastUsed.sort((a, b) => {
      const aDate = a.lastUsedAt?.getTime() ?? 0
      const bDate = b.lastUsedAt?.getTime() ?? 0
      return aDate - bDate
    })

    const res: z.infer<ReturnType<typeof getApiKeysResponseSchema>> = {
      data: apiKeysWithLastUsed,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
