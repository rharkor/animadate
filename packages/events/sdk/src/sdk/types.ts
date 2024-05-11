import { z } from "zod"

import { isLevelEnabled } from "@/lib/level"

export const PushEventSchema = z.object({
  name: z.string(),
  kind: z.enum(["AUTHENTICATION", "MAILING", "NOTIFICATION", "PROFILE", "SECURITY", "PET", "MATCH"]),
  level: z.enum(["DEBUG", "INFO", "WARNING", "ERROR"]).refine((value) => {
    const enabled = isLevelEnabled(value)
    if (!enabled) throw new Error(`Level ${value} is not enabled`)
  }),
  data: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
})
export type TPushEvent = z.infer<typeof PushEventSchema>

export type KIND = TPushEvent["kind"]
export type LEVEL = TPushEvent["level"]
