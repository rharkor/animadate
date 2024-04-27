"use client"
import { createContext } from "react"

export type SigningOutContextType = {
  isSigningOut: boolean
  setIsSigningOut: (isSigningOut: boolean) => void
}

export const SigningOutContext = createContext<SigningOutContextType | null>(null)
