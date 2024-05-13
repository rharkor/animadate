import { NextRequest, NextResponse } from "next/server"

import { pushEvent } from "@/api/events/mutations"
import { pushEventResponseSchema, pushEventSchema } from "@/api/events/schemas"
import { ensureApiAuth } from "@/lib/server/trpc"
import { ITrpcContext } from "@/types"

export async function POST(request: NextRequest) {
  const json = await request.json()
  const parsed = pushEventSchema().safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 })
  }
  const error = await ensureApiAuth(request.headers)
  if (error) return error
  const res = await pushEvent({
    ctx: {} as ITrpcContext,
    input: parsed.data,
  })
  const resParsed = pushEventResponseSchema().safeParse(res)
  if (!resParsed.success) {
    return NextResponse.json(
      {
        message: "Output schema validation failed",
        error: resParsed.error,
      },
      { status: 500 }
    )
  }
  return NextResponse.json(resParsed)
}

export async function GET() {
  return NextResponse.json({ message: "Hello from push event" })
}
