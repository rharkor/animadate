import { eventsPrisma } from "@/lib/prisma/events"
import events from "@animadate/events-sdk"
import { logger } from "@animadate/lib"

const clearOldEvents = async () => {
  const maxAge = 1000 * 60 * 60 * 24 * 7 // 30 days
  const now = new Date()

  const deletedEvents = await eventsPrisma.event.deleteMany({
    where: {
      createdAt: {
        lt: new Date(now.getTime() - maxAge),
      },
    },
  })
  logger.debug(`Deleted ${deletedEvents.count} old events`)
  events.push({
    name: "cron.clearOldEvents",
    kind: "CRON",
    level: "INFO",
    data: {
      count: deletedEvents.count,
    },
    context: {
      app: "cron",
      date: now.toISOString(),
    },
  })
}

const main = async () => {
  const maxDurationWarning = 1000 * 60 * 5 // 5 minutes
  const name = "ClearOldEvents"
  const now = new Date()

  logger.prefix = () => `[${new Date().toLocaleString()}] `
  await clearOldEvents().catch((err) => {
    logger.error(
      `${name} started at ${now.toLocaleString()} and failed after ${new Date().getTime() - now.getTime()}ms`
    )
    throw err
  })
  const took = new Date().getTime() - now.getTime()
  if (took > maxDurationWarning) logger.warn(`${name} took ${took}ms`)
}

main()
