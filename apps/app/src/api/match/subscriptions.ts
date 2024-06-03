import z from "zod"

import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { ApiError } from "@/lib/utils/server-utils"
import { ITrpcContext } from "@/types"
import { logger } from "@animadate/lib"
import { observable } from "@trpc/server/observable"

import { onMatchResponseSchema, onMatchSchema } from "./schemas"

export const onMatch = async ({
  ctx: { session },
}: {
  ctx: ITrpcContext
  input: z.infer<ReturnType<typeof onMatchSchema>>
}) => {
  if (!session || !session.user) {
    return ApiError("unauthorized", "UNAUTHORIZED")
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    include: {
      pet: true,
    },
  })
  if (!user) {
    return ApiError("userNotFound", "NOT_FOUND")
  }
  if (!user.pet) {
    return ApiError("petNotFound", "NOT_FOUND")
  }
  const channel = `on-match:${user.pet.id}`
  return observable<z.infer<ReturnType<typeof onMatchResponseSchema>>>((emit) => {
    const onMatch = (_channel: string, data: string) => {
      if (_channel !== channel) return
      try {
        const dataParsed = JSON.parse(data)
        const dataValidated = onMatchResponseSchema().parse(dataParsed)
        emit.next(dataValidated)
      } catch (error) {
        logger.error(error)
      }
    }
    const register = async () => {
      await redis.connect().catch(() => {})
      await redis.subscribe(channel)
      logger.debug(`Subscribed to ${channel}`)
      redis.on("message", onMatch)
    }
    register()

    return () => {
      redis.unsubscribe(channel)
    }
  })
}
