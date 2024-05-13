import path from "path"

import { eventsPrisma } from "@/lib/prisma/events"
import { Prisma } from "@animadate/events-db/generated/client"
import events from "@animadate/events-sdk"
import { logger } from "@animadate/lib"

const main = async () => {
  try {
    await eventsPrisma.event.findMany({
      orderBy: [
        {
          unknownField: "asc",
        } as Prisma.EventOrderByWithRelationInput,
      ],
    })
  } catch (error) {
    let errorParsed = error instanceof Error ? error.message : error
    try {
      errorParsed = JSON.parse(errorParsed as string)
    } catch (e) {}
    events.push({
      kind: "OTHER",
      level: "ERROR",
      name: "Unhandled error in trpc server",
      data: {
        path: path.join("."),
        error: errorParsed,
      },
      context: {
        app: "admin",
        date: new Date().toISOString(),
      },
    })
  }
  logger.success("Error sent!")
}

main()
