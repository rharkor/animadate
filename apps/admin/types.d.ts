import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user:
      | (DefaultSession & {
          id: string
          role: string
          uuid: string
          email: string
          name: string
          role: string
          hasPassword: boolean
          emailVerified: Date | null
          image: never
          lastLocale: string | null
        })
      | undefined
  }
}

declare module "next-auth/jwt/types" {
  interface JWT {
    uuid: string
    role: string
    hasPassword: boolean
  }
}
