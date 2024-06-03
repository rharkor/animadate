import { Session } from "next-auth"
import { IncomingMessage } from "http"
import superjson from "superjson"
import { z, ZodError } from "zod"

import { sessionsSchema } from "@/api/me/schemas"
import { getAuthApi } from "@/components/auth/require-auth"
import { env } from "@/lib/env"
import { wssAuthSchema } from "@/schemas/auth"
import { User } from "@animadate/app-db/generated/client"
import { initTRPC } from "@trpc/server"

import { apiRateLimiter } from "../rate-limit"
import { redis } from "../redis"
import { Context } from "../trpc/context"
import { ApiError, WsError } from "../utils/server-utils"

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === "BAD_REQUEST" && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const middleware = t.middleware
const hasRateLimit = middleware(async (opts) => {
  if (opts.ctx.req && !(opts.ctx.req instanceof IncomingMessage)) {
    const { headers } = await apiRateLimiter(opts.ctx.req)
    return opts.next({
      ctx: {
        Headers: headers,
      },
    })
  }
  return opts.next()
})
export const publicProcedure = t.procedure.use(hasRateLimit)
const isAuthenticated = middleware(async (opts) => {
  const { session } = await getAuthApi()

  if (!session) {
    await ApiError("unauthorized", "UNAUTHORIZED")
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      session,
    },
  })
})
const hasVerifiedEmail = middleware(async (opts) => {
  const { ctx } = opts
  const session = ctx.session as (Session & { user: Omit<User, "password"> }) | null
  if (!session || (!session.user.emailVerified && env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true)) {
    await ApiError("emailNotVerified", "UNAUTHORIZED", {
      redirect: false,
    })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated).use(hasVerifiedEmail)
export const authenticatedNoEmailVerificationProcedure = publicProcedure.use(isAuthenticated)

const wsIsAuthenticated = middleware(async (opts) => {
  const rawInput = await opts.getRawInput()
  const input = await wssAuthSchema()
    .parseAsync(rawInput)
    .catch(() => null)
  if (!input) return WsError("unknownError", "BAD_REQUEST")
  if (!opts.ctx.req) return WsError("unauthorized", "UNAUTHORIZED")
  if (!(opts.ctx.req instanceof IncomingMessage)) {
    return WsError("unauthorized", "UNAUTHORIZED")
  }

  const key = `session:${input.userId}:${input.uuid}`
  const loginSession = await redis.get(key)
  if (!loginSession) {
    return ApiError("unauthorized", "UNAUTHORIZED")
  }
  const data = JSON.parse(loginSession) as z.infer<ReturnType<typeof sessionsSchema>>
  return opts.next({
    ctx: {
      ...opts.ctx,
      session: { user: data } as unknown as Session,
    },
  })
})
export const wsAuthenticatedProcedure = publicProcedure.use(wsIsAuthenticated)
