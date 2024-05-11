import { env } from "@/lib/env"
import { isLevelEnabled } from "@/lib/level"
import { logger } from "@animadate/lib"

import { PushEventSchema, TPushEvent } from "./types"

export const pushEvent = async (params: TPushEvent) => {
  try {
    const enabled = isLevelEnabled(params.level)
    if (!enabled) return
    const body = PushEventSchema.parse(params)
    const res = await fetch(env.EVENTS_API_URL, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to push event: ${text}`)
    }
  } catch (error) {
    logger.error("Failed to push event", error)
    console.error(error)
  }
}
