import { IncomingMessage } from "http"
import requestIp from "request-ip"

import { Session } from "@/types/auth"

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
