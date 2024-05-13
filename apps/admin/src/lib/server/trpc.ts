import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Session } from "next-auth"
import jwt from "jsonwebtoken"
import superjson from "superjson"
import { ZodError } from "zod"

import { getAuthApi } from "@/components/auth/require-auth"
import { env } from "@/lib/env"
import { User } from "@animadate/app-db/generated/client"
import { initTRPC } from "@trpc/server"

import { apiRateLimiter } from "../rate-limit"
import { Context } from "../trpc/context"
import { ApiError } from "../utils/server-utils"

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
  if (opts.ctx.req) {
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

export const ensureApiAuth = async (_headers?: Headers) => {
  let authorization: string | null
  if (!_headers) {
    const headersStore = headers()
    authorization = headersStore.get("authorization")
  } else {
    authorization = _headers.get("authorization")
  }
  if (!authorization) {
    if (!_headers) {
      await ApiError("unauthorized", "UNAUTHORIZED")
      throw new Error("unauthorized")
    } else {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Authorization header is missing",
        },
        {
          status: 401,
        }
      )
    }
  }
  const token = authorization.split(" ")[1]
  try {
    jwt.verify(token, env.AUTH_SECRET)
  } catch (error) {
    if (!_headers) {
      await ApiError("unauthorized", "UNAUTHORIZED")
    } else {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Invalid token",
        },
        {
          status: 401,
        }
      )
    }
  }
}
const isApiAuthenticated = middleware(async (opts) => {
  await ensureApiAuth()
  return opts.next()
})
export const apiAuthenticatedProcedure = publicProcedure.use(isApiAuthenticated)
