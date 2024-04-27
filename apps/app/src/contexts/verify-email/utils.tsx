import { useContext } from "react"

import { VerifyEmailContext } from "./context"

export const useVerifyEmail = () => {
  const context = useContext(VerifyEmailContext)
  if (context === undefined) {
    throw new Error("useVerifyEmail must be used within a VerifyEmailProvider")
  }
  return context
}
