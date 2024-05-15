import { PrismaClient } from "@animadate/events-db/generated/client"

const globalForPrisma = global as unknown as { eventsPrisma: PrismaClient }

export const eventsPrisma =
  globalForPrisma.eventsPrisma ||
  new PrismaClient().$extends({
    query: {
      apiKey: {
        async $allOperations({ args, query }) {
          const result = await query(args)
          if (
            !("select" in args) ||
            (args.select && typeof args.select === "object" && "key" in args.select && args.select.key !== true)
          ) {
            if (Array.isArray(result)) result.forEach((r) => "key" in r && delete r.key)
            else typeof result === "object" && result && "key" in result && delete result.key
          }
          return result
        },
      },
    },
  })

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") globalForPrisma.eventsPrisma = eventsPrisma
