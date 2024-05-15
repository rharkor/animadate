import { z } from "zod"

import { queriesOptionPage, queriesOptionPerPage } from "@/lib/queries-options"
import { PushEventSchema } from "@animadate/events-sdk/dist/sdk/types"

export const pushEventSchema = () => PushEventSchema
export const pushEventResponseSchema = () => z.object({ success: z.boolean() })

export const createEmailContactchema = () =>
  z.object({
    email: z.string().email(),
  })
export const createEmailContactResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const deleteEmailContactchema = () =>
  z.object({
    id: z.string(),
  })

export const deleteEmailContactResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const getEmailContactsSchema = () =>
  z.object({
    page: queriesOptionPage(),
    perPage: queriesOptionPerPage(),
    email: z.string(),
  })

export const getEmailContactsResponseSchema = () =>
  z.object({
    data: z.array(
      z.object({
        id: z.string(),
        email: z.string(),
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
