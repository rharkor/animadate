import { LEVEL } from "@/sdk/types"

import { env } from "./env"

export const isLevelEnabled = (level: LEVEL) => {
  if (env.DISABLE_EVENTS_PUSH) {
    return false
  }

  // Disable debug when not in dev
  if (level === "DEBUG" && env.ENV !== "development") {
    return false
  }

  return true
}
