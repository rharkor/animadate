import { z } from "zod"

import { eventsPrisma } from "@/lib/prisma/events"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { Prisma } from "@animadate/events-db/generated/client"

import { getEventsResponseSchema, getEventsSchema } from "./schemas"

export const getEvents = async ({ input }: apiInputFromSchema<typeof getEventsSchema>) => {
  try {
    const { page, perPage, kinds, levels, name } = input

    const skip = (page - 1) * perPage
    const take = perPage

    const where: Prisma.EventWhereInput = {
      name: {
        contains: name,
      },
      kind: {
        in: kinds,
      },
      level: {
        in: levels,
      },
    }
    const events = await eventsPrisma.event.findMany({
      where,
      skip,
      take,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    })
    const total = await eventsPrisma.event.count({
      where,
    })

    const data = getEventsResponseSchema().shape.data.parse(events)
    const res: z.infer<ReturnType<typeof getEventsResponseSchema>> = {
      data,
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
