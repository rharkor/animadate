"use client"
import { useContext } from "react"

import { SigningOutContext } from "./context"

export const useIsSigningOut = () => {
  const context = useContext(SigningOutContext)
  if (!context) {
    throw new Error("useIsSigningOut must be used within a SigningOutProvider")
  }
  return context
}
