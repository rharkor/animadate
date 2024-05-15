import { z } from "zod"

import { eventsPrisma } from "@/lib/prisma/events"
import { getContext } from "@/lib/utils/events"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import events from "@animadate/events-sdk"

import {
  createEmailContactchema,
  createEmailContactResponseSchema,
  deleteEmailContactchema,
  deleteEmailContactResponseSchema,
} from "./schemas"

export const createEmailContact = async ({
  input,
  ctx: { req, session },
}: apiInputFromSchema<typeof createEmailContactchema>) => {
  ensureLoggedIn(session)
  try {
    const { email } = input
    const emailContact = await eventsPrisma.alertEmailContact.create({
      data: {
        email,
      },
    })
    events.push({
      name: "email-contact.created",
      kind: "OTHER",
      level: "INFO",
      context: getContext({ req, session }),
      data: { id: emailContact.id, email },
    })
    const res: z.infer<ReturnType<typeof createEmailContactResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteEmailContact = async ({
  input,
  ctx: { req, session },
}: apiInputFromSchema<typeof deleteEmailContactchema>) => {
  ensureLoggedIn(session)
  try {
    const { id } = input
    const emailContact = await eventsPrisma.alertEmailContact.delete({
      where: {
        id,
      },
    })
    events.push({
      name: "email-contact.deleted",
      kind: "OTHER",
      level: "INFO",
      context: getContext({ req, session }),
      data: { id, email: emailContact.email },
    })
    const res: z.infer<ReturnType<typeof deleteEmailContactResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
