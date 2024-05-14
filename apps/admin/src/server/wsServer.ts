import ws from "ws"

import { appRouter } from "@/api/_app"
import { createContext } from "@/lib/trpc/context"
import { logger } from "@animadate/lib"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import { exit } from "process"

const wss = new ws.Server({
  // eslint-disable-next-line no-process-env
  port: process.env.PORT ? parseInt(process.env.PORT) : 3004,
})
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
})

wss.on("connection", (ws) => {
  logger.debug(`++ Connection (${wss.clients.size})`)
  ws.once("close", () => {
    logger.debug(`-- Connection (${wss.clients.size})`)
  })
})
logger.info(`WebSocket Server listening on ws://localhost:${wss.options.port}`)

process.on("SIGTERM", () => {
  handler.broadcastReconnectNotification()
  wss.close()
  exit(0)
})
