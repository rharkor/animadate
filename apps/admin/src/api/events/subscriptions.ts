import z from "zod"

import { redis } from "@/lib/redis"
import { logger } from "@animadate/lib"
import { observable } from "@trpc/server/observable"

import { onNewEventResponseSchema } from "./schemas"

export const onNewEvent = () => {
  const channel = `on-new-event`
  return observable<z.infer<ReturnType<typeof onNewEventResponseSchema>>>((emit) => {
    const onNewInvitation = (_channel: string, data: string) => {
      if (_channel !== channel) return
      try {
        const dataParsed = JSON.parse(data)
        const dataValidated = onNewEventResponseSchema().parse(dataParsed)
        emit.next(dataValidated)
      } catch (error) {
        logger.error(error)
      }
    }
    const register = async () => {
      await redis.connect().catch(() => {})
      await redis.subscribe(channel)
      logger.debug(`Subscribed to ${channel}`)
      redis.on("message", onNewInvitation)
    }
    register()

    return () => {
      redis.unsubscribe(channel)
    }
  })
}
