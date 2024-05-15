import { LEVEL, levels } from "@/sdk/types"

import { env } from "./env"

export const getEnabledLevels = () => {
  if (env.DISABLE_EVENTS_PUSH) {
    return []
  }

  return levels.filter((level) => isLevelEnabled(level))
}

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
