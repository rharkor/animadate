import { apiAuthenticatedProcedure, router } from "@/lib/server/trpc"

import { pushEvent } from "./mutations"
import { pushEventResponseSchema, pushEventSchema } from "./schemas"

export const eventsRouter = router({
  push: apiAuthenticatedProcedure.input(pushEventSchema()).output(pushEventResponseSchema()).mutation(pushEvent),
})
