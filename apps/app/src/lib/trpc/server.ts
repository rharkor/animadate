import { redirect } from "next/navigation"

import { authRoutes } from "@/constants/auth"
import { TRPCError } from "@trpc/server"

import { appRouter } from "../../api/_app"
import { createCallerFactory } from "../server/trpc"
import { TErrorMessage } from "../utils/server-utils"

import { createContext } from "./context"

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
const _serverTrpc = createCallerFactory(appRouter)(createContext(undefined, true))

type RecursiveProxy = {
  [key: string]: RecursiveProxy
  (): void
}

function noop() {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolvePath(obj: any, path: string[]): any {
  return path.reduce((currentObject, key) => currentObject?.[key], obj)
}

function createRecursiveProxy(path: string[] = []): RecursiveProxy {
  return new Proxy(noop, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        return createRecursiveProxy([...path, prop])
      }
      return Reflect.get(target, prop, receiver)
    },
    apply(target, thisArg, args) {
      //* Call the server trpc function
      return handleServerError(resolvePath(_serverTrpc, path)(...args))
    },
  }) as RecursiveProxy
}

export const serverTrpc = createRecursiveProxy() as unknown as typeof _serverTrpc

export const handleServerError = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    console.error(error)
    //? if error code is NEXT_REDIRECT
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      try {
        const data = JSON.parse(error.message) as TErrorMessage | string
        if (typeof data !== "string") {
          const avoidRedirect = data.extra && "redirect" in data.extra && data.extra.redirect === false
          if (!avoidRedirect) {
            redirect(authRoutes.redirectOnUnhauthorized)
          }
        }
      } catch (e) {}
      redirect(authRoutes.redirectOnUnhauthorized)
    }
    throw error
  }
}
