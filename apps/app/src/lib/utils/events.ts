import requestIp from "request-ip"

import { Session } from "@/types/auth"

export const getDefaultContext = () => {
  return {
    app: "app",
    date: new Date().toISOString(),
  }
}

export const getContext = ({ req, session }: { req: Request | null | undefined; session: Session | null }) => {
  const extended: {
    session?: Session | null
    identifier?: string
  } = {}
  if (session) {
    extended.session = session
  }
  if (req) {
    const headers: Record<string, string> = {}
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
  return {
    ...getDefaultContext(),
    extended,
  }
}
