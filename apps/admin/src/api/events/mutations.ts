import { z } from "zod"

import { eventsPrisma } from "@/lib/prisma/events"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { pushEventResponseSchema, pushEventSchema } from "./schemas"

export const pushEvent = async ({ input }: apiInputFromSchema<typeof pushEventSchema>) => {
  try {
    const data = input
    await eventsPrisma.event.create({
      data,
    })
    const res: z.infer<ReturnType<typeof pushEventResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
