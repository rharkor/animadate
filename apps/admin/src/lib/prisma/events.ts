import { PrismaClient } from "@animadate/events-db/generated/client"

const globalForPrisma = global as unknown as { eventsPrisma: PrismaClient }

export const eventsPrisma = globalForPrisma.eventsPrisma || new PrismaClient()

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") globalForPrisma.eventsPrisma = eventsPrisma
