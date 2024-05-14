import { z } from "zod"

import { eventsPrisma } from "@/lib/prisma/events"
import { redis } from "@/lib/redis"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { logger } from "@animadate/lib"

import { onNewEventResponseSchema, pushEventResponseSchema, pushEventSchema } from "./schemas"

export const pushEvent = async ({ input }: apiInputFromSchema<typeof pushEventSchema>) => {
  try {
    const data = input
    const event = await eventsPrisma.event.create({
      data,
    })

    //? Trigger the invitation event
    const emitter = redis.duplicate()
    await emitter.connect().catch(() => {})
    const eventData = onNewEventResponseSchema().parse(event)
    await emitter.publish(`on-new-event`, JSON.stringify(eventData))
    logger.debug("on-new-event triggered", { name: data.name })

    const res: z.infer<ReturnType<typeof pushEventResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
