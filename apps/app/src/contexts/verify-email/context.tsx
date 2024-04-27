import { createContext } from "react"

export type TVerifyEmailContext = {
  isOpen: boolean
}

export const VerifyEmailContext = createContext<TVerifyEmailContext | null>(null)
