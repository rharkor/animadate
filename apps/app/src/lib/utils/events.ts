import requestIp from "request-ip"

import { Session } from "@/types/auth"

export const getContext = ({ req, session }: { req: Request; session: Session | null }) => {
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })
  const identifier = requestIp.getClientIp({
    ...req,
    headers,
  })
  return {
    ip: identifier,
    session,
  }
}
