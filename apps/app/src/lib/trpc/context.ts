import { ITrpcContext } from "@/types"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws"

export function createContext(opts?: FetchCreateContextFnOptions | CreateWSSContextFnOptions, fromServer?: boolean) {
  const response: ITrpcContext = {
    session: null,
    headers: opts && Object.fromEntries(Object.entries(opts.req.headers)),
    req: opts && opts.req,
    fromServer,
  }
  return response
}

export type Context = Awaited<ReturnType<typeof createContext>>
