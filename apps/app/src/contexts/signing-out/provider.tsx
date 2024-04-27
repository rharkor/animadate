"use client"
import { useState } from "react"

import { SigningOutContext } from "./context"

export default function SigningOutProvider({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  return <SigningOutContext.Provider value={{ isSigningOut, setIsSigningOut }}>{children}</SigningOutContext.Provider>
}
