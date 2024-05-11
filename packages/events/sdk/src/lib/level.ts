import { LEVEL } from "@/sdk/types"

import { env } from "./env"

export const isLevelEnabled = (level: LEVEL) => {
  // Disable debug when not in dev
  if (level === "DEBUG" && env.ENV !== "development") {
    return false
  }

  return true
}
