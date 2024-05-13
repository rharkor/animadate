import { apiAuthenticatedProcedure, authenticatedProcedure, router } from "@/lib/server/trpc"

import { pushEvent } from "./mutations"
import { getEvents } from "./queries"
import { getEventsResponseSchema, getEventsSchema, pushEventResponseSchema, pushEventSchema } from "./schemas"

export const eventsRouter = router({
  push: apiAuthenticatedProcedure.input(pushEventSchema()).output(pushEventResponseSchema()).mutation(pushEvent),
  getEvents: authenticatedProcedure.input(getEventsSchema()).output(getEventsResponseSchema()).query(getEvents),
})
