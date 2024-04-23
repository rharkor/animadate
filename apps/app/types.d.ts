import type { DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultUser & {
      id: string
      role: string
      uuid: string
      email: string
      name: string
      role: string
      hasPassword: boolean
      emailVerified: Date | null
      image: never
    }
  }
}

declare module "next-auth/jwt/types" {
  interface JWT {
    uuid: string
    role: string
    hasPassword: boolean
  }
}
