import { DefaultSession } from "next-auth"

export type Session = {
  id?: unknown
  email?: string | null
} & DefaultSession

export type ApiKeyJWTPayload = {
  key: string
  name: string
}
