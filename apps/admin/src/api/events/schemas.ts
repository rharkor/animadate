import { z } from "zod"

import { queriesOptionPage, queriesOptionPerPage } from "@/lib/queries-options"
import { PushEventSchema } from "@animadate/events-sdk/dist/sdk/types"

export const pushEventSchema = () => PushEventSchema
export const pushEventResponseSchema = () => z.object({ success: z.boolean() })

export const getEventsSchema = () =>
  z.object({
    page: queriesOptionPage(),
    perPage: queriesOptionPerPage(),
  })

export const eventSchema = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    level: z.string(),
    data: z.record(z.any()).optional(),
    context: z.object({
      app: z.string(),
      date: z.string(),
      extended: z.record(z.any()).optional(),
    }),
    createdAt: z.date(),
  })

export const getEventsResponseSchema = () =>
  z.object({
    data: z.array(eventSchema()),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  })
