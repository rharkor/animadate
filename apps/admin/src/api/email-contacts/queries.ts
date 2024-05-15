import { z } from "zod"

import { eventsPrisma } from "@/lib/prisma/events"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { Prisma } from "@animadate/events-db/generated/client"

import { getEmailContactsResponseSchema, getEmailContactsSchema } from "./schemas"

export const getEmailContacts = async ({ input }: apiInputFromSchema<typeof getEmailContactsSchema>) => {
  try {
    const { page, perPage, email } = input

    const skip = (page - 1) * perPage
    const take = perPage

    const where: Prisma.AlertEmailContactWhereInput = {
      email: {
        contains: email,
      },
    }

    const emailContacts = await eventsPrisma.alertEmailContact.findMany({
      where,
      skip,
      take,
    })
    const total = await eventsPrisma.alertEmailContact.count({ where })

    const res: z.infer<ReturnType<typeof getEmailContactsResponseSchema>> = {
      data: emailContacts,
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
