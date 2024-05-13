import { z } from "zod"

import { queriesOptionPage, queriesOptionPerPage, queriesOptionSort } from "@/lib/queries-options"
import { PushEventSchema } from "@animadate/events-sdk/dist/sdk/types"

export const pushEventSchema = () => PushEventSchema
export const pushEventResponseSchema = () => z.object({ success: z.boolean() })

export const createApiKeySchema = () =>
  z.object({
    name: z.string().min(1).max(255),
  })
export const createApiKeyResponseSchema = () =>
  z.object({
    apiKeyId: z.string(),
    apiKeySecret: z.string(),
  })

export const deleteApiKeySchema = () =>
  z.object({
    id: z.string(),
  })

export const deleteApiKeyResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const getApiKeysSchema = () =>
  z.object({
    page: queriesOptionPage(),
    perPage: queriesOptionPerPage(),
    sort: queriesOptionSort(),
  })

export const getApiKeysResponseSchema = () =>
  z.object({
    data: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        lastUsedAt: z.date().nullable(),
        firstUsed: z.date().nullable(),
        createdAt: z.date(),
      })
    ),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  })
