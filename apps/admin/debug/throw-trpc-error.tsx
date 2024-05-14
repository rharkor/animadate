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
    const errorOutput: { [key: string]: unknown } = {
      raw: error,
    }
    if (error instanceof Error) {
      errorOutput.message = error.message
      errorOutput.name = error.name
      errorOutput.stack = error.stack
    }
    if (typeof error === "string") {
      try {
        const errorJsonParsed = JSON.parse(error)
        errorOutput.json = errorJsonParsed
      } catch (e) {}
    }
    const path: string[] = []
    const pathString = path.join(".")
    events.push({
      kind: "OTHER",
      level: "ERROR",
      name: `test.unhandledServerError${path.length > 0 ? `.${pathString}` : ""}`,
      data: {
        path: pathString,
        error: errorOutput,
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
