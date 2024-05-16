import { z } from "zod"

export const kinds = [
  "AUTHENTICATION",
  "MAILING",
  "NOTIFICATION",
  "PROFILE",
  "SECURITY",
  "PET",
  "MATCH",
  "CRON",
  "FILE",
  "OTHER",
] as const
export const levels = ["DEBUG", "INFO", "WARNING", "ERROR"] as const
export const PushEventSchema = z.object({
  name: z.string(),
  kind: z.enum(kinds),
  level: z.enum(levels),
  data: z.record(z.any()).optional(),
  context: z.object({
    app: z.string(),
    date: z.string(),
    extended: z.record(z.any()).optional(),
  }),
})
export type TPushEvent = z.infer<typeof PushEventSchema>

export type KIND = TPushEvent["kind"]
export type LEVEL = TPushEvent["level"]
