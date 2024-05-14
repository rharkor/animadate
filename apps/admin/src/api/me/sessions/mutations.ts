import { deleteSessionSchema } from "@/api/me/schemas"
import { redis } from "@/lib/redis"
import { getContext } from "@/lib/utils/events"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import events from "@animadate/events-sdk"

export const deleteSession = async ({
  input,
  ctx: { session, req },
}: apiInputFromSchema<typeof deleteSessionSchema>) => {
  try {
    ensureLoggedIn(session)
    const { id } = input
    //* Delete session
    await redis.del(`session:${session.user.id}:${id}`)
    events.push({
      name: "user.session.deleted",
      kind: "PROFILE",
      level: "INFO",
      context: getContext({ req, session }),
      data: { id },
    })

    return { id }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
