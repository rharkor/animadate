export const SESSION_MAX_AGE = 360 * 24 * 60 * 60 // 360 days

export const authRoutes = {
  signIn: ["/sign-in", "/login", "/signin"],
  signUp: ["/sign-up", "/register", "/signup"],
  redirectAfterSignIn: "/events",
  redirectAfterSignUp: "/events",
  redirectOnUnhauthorized: "/sign-in",
}

export const minPasswordLength = 8
export const maxPasswordLength = 25

export const authCookieName = "animadate-session-token"
export const getRedisApiKeyExists = (key: string) => `events:api-key:exists:${key}`
export const getRedisApiKeyLastUsed = (id: string) => `events:api-key:last-used:${id}`
