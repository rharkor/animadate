import z from "zod"

import { redis } from "@/lib/redis"
import { logger } from "@animadate/lib"
import { observable } from "@trpc/server/observable"

import { onNewEventResponseSchema } from "./schemas"

export const onNewEvent = () => {
  return observable<z.infer<ReturnType<typeof onNewEventResponseSchema>>>((emit) => {
    const subscriber = redis.duplicate()
    const onNewInvitation = (_: string, data: string) => {
      try {
        const dataParsed = JSON.parse(data)
        const dataValidated = onNewEventResponseSchema().parse(dataParsed)
        emit.next(dataValidated)
      } catch (error) {
        logger.error(error)
      }
    }
    const register = async () => {
      await subscriber.connect().catch(() => {})
      await subscriber.subscribe(`on-new-event`)
      logger.debug(`Subscribed to on-new-event`)
      subscriber.on("message", onNewInvitation)
    }
    register()

    return () => {
      subscriber.unsubscribe(`on-new-event`)
    }
  })
}
