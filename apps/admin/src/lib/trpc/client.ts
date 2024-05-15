import SuperJSON from "superjson"

import { type AppRouter } from "@/api/_app"
import { createTRPCReact, createWSClient, httpBatchLink, loggerLink, splitLink, wsLink } from "@trpc/react-query"

import { env } from "../env"

import { getBaseUrl } from "./utils"

export const trpc = createTRPCReact<AppRouter>({})

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: env.NEXT_PUBLIC_WS_URL,
})

export const trpcClient = trpc.createClient({
  links: [
    // adds pretty logs to your console in development and logs errors in production
    loggerLink({
      enabled: (opts) =>
        // eslint-disable-next-line no-process-env
        (process.env.NODE_ENV === "development" && typeof window !== "undefined") ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    splitLink({
      condition(op) {
        return op.type === "subscription"
      },
      true: wsLink<AppRouter>({
        client: wsClient,
        transformer: SuperJSON,
      }),
      false: httpBatchLink<AppRouter>({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: SuperJSON,
      }),
    }),
  ],
})
