import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Session } from "next-auth"
import { IncomingMessage } from "http"
import superjson from "superjson"
import { z, ZodError } from "zod"

import { sessionsSchema } from "@/api/me/schemas"
import { getAuthApi } from "@/components/auth/require-auth"
import { rolesAsObject } from "@/constants"
import { getRedisApiKeyExists, getRedisApiKeyLastUsed } from "@/constants/auth"
import { env } from "@/lib/env"
import { wssAuthSchema } from "@/schemas/auth"
import { User } from "@animadate/app-db/generated/client"
import { initTRPC } from "@trpc/server"

import { bcryptCompare } from "../bcrypt"
import { eventsPrisma } from "../prisma/events"
import { apiRateLimiter } from "../rate-limit"
import { eventsRedis, redis } from "../redis"
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

  if (session?.user?.role !== rolesAsObject.admin) {
    await ApiError("unauthorized", "UNAUTHORIZED")
  }

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
  let apiKey: { id: string | null; secret: string | null } = { id: null, secret: null }
  if (!_headers) {
    const headersStore = headers()
    const id = headersStore.get("x-api-key-id")
    const secret = headersStore.get("x-api-key-secret")
    apiKey = { id, secret }
  } else {
    const id = _headers.get("x-api-key-id")
    const secret = _headers.get("x-api-key-secret")
    apiKey = { id, secret }
  }
  if (!apiKey.id) {
    if (!_headers) {
      await ApiError("unauthorized", "UNAUTHORIZED")
      throw new Error("unauthorized")
    } else {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Api key id header is missing",
        },
        {
          status: 401,
        }
      )
    }
  } else if (!apiKey.secret) {
    if (!_headers) {
      await ApiError("unauthorized", "UNAUTHORIZED")
      throw new Error("unauthorized")
    } else {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Api key secret header is missing",
        },
        {
          status: 401,
        }
      )
    }
  }

  //* Check if token is valid
  const keyFromRedis = await eventsRedis.get(getRedisApiKeyExists(apiKey.id))
  if (keyFromRedis) {
    const keyMatch = await bcryptCompare(apiKey.secret, keyFromRedis)
    if (!keyMatch) {
      if (!_headers) {
        await ApiError("unauthorized", "UNAUTHORIZED")
        throw new Error("unauthorized")
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
  } else {
    const keyFromDb = await eventsPrisma.apiKey.findUnique({
      where: {
        id: apiKey.id,
      },
      select: {
        key: true,
        firstUsed: true,
        id: true,
      },
    })
    const keyMatch = await bcryptCompare(apiKey.secret, keyFromDb?.key || "")
    if (!keyFromDb || !keyMatch) {
      if (!_headers) {
        await ApiError("unauthorized", "UNAUTHORIZED")
        throw new Error("unauthorized")
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
    await eventsRedis.setex(getRedisApiKeyExists(apiKey.id), 60 * 60, keyFromDb.key) // 1 hour
    if (!keyFromDb?.firstUsed) {
      await eventsPrisma.apiKey.update({
        where: {
          id: keyFromDb.id,
        },
        data: {
          firstUsed: new Date(),
        },
      })
    }
  }

  //* Save last used
  await eventsRedis.setex(getRedisApiKeyLastUsed(apiKey.id), 60 * 60 * 24 * 30, Date.now().toString()) // 30 days
}
const isApiAuthenticated = middleware(async (opts) => {
  await ensureApiAuth()
  return opts.next()
})
export const apiAuthenticatedProcedure = publicProcedure.use(isApiAuthenticated)

const onlyDev = middleware(async (opts) => {
  if (env.ENV !== "development") {
    await ApiError("unauthorized", "UNAUTHORIZED")
  }
  return opts.next()
})
export const devProcedure = publicProcedure.use(onlyDev)

const wsIsAuthenticated = middleware(async (opts) => {
  const rawInput = await opts.getRawInput()
  const input = await wssAuthSchema()
    .parseAsync(rawInput)
    .catch(() => null)
  if (!input) return ApiError("unknownError", "BAD_REQUEST")
  if (!opts.ctx.req) return ApiError("unauthorized", "UNAUTHORIZED")
  if (!(opts.ctx.req instanceof IncomingMessage)) {
    return ApiError("unauthorized", "UNAUTHORIZED")
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
