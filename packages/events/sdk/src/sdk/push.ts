import { join } from "path"

import { env } from "@/lib/env"
import { isLevelEnabled } from "@/lib/level"
import { logger } from "@animadate/lib"

import { PushEventSchema, TPushEvent } from "./types"

export const pushEvent = async (params: TPushEvent) => {
  try {
    const enabled = isLevelEnabled(params.level)
    if (!enabled) return
    const body = PushEventSchema.parse(params)
    const res = await fetch(join(env.EVENTS_API_URL, "api", "events", "push"), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.EVENTS_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(
        "Failed to push event: " +
          JSON.stringify({
            status: res.status,
            statusText: res.statusText,
            json,
          })
      )
    }
  } catch (error) {
    logger.error(error)
  }
}
