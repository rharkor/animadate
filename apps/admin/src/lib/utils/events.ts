import { IncomingMessage } from "http"
import requestIp from "request-ip"

import { Session } from "@/types/auth"

import { eventsRedis } from "../redis"

export const getDefaultContext = () => {
  return {
    app: "admin",
    date: new Date().toISOString(),
  }
}

export const getContext = ({
  req,
  session,
}: {
  req: Request | IncomingMessage | null | undefined
  session: Session | null
}) => {
  const extended: {
    session?: Session | null
    identifier?: string
  } = {}
  if (session) {
    extended.session = session
  }
  if (req) {
    const headers: Record<string, string> = {}
    if (req instanceof IncomingMessage) {
      req.headers = req.headers || {}
    } else {
      req.headers.forEach((value, key) => {
        headers[key] = value
      })
      const identifier = requestIp.getClientIp({
        ...req,
        headers,
      })
      if (identifier) {
        extended.identifier = identifier
      }
    }
  }
  return {
    ...getDefaultContext(),
    extended,
  }
}

//* Utils
const eventAlertEmailThrottleKey = `event-alert-email-throttle`
// 3/hour
const eventAlertEmailThrottleTtl = 60 * 60 // 1 hour
const eventAlertEmailThrottleMax = 3

//? Check if we can send an event alert email
export const canSendEventAlertEmail = async () => {
  const count = await eventsRedis.incr(eventAlertEmailThrottleKey)
  if (count === 1) {
    await eventsRedis.expire(eventAlertEmailThrottleKey, eventAlertEmailThrottleTtl)
  }
  return count <= eventAlertEmailThrottleMax
}
