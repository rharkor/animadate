import { apiAuthenticatedProcedure, authenticatedProcedure, router, wsAuthenticatedProcedure } from "@/lib/server/trpc"
import { wssAuthSchema } from "@/schemas/auth"

import { pushEvent } from "./mutations"
import { getEvents } from "./queries"
import { getEventsResponseSchema, getEventsSchema, pushEventResponseSchema, pushEventSchema } from "./schemas"
import { onNewEvent } from "./subscriptions"

export const eventsRouter = router({
  push: apiAuthenticatedProcedure.input(pushEventSchema()).output(pushEventResponseSchema()).mutation(pushEvent),
  getEvents: authenticatedProcedure.input(getEventsSchema()).output(getEventsResponseSchema()).query(getEvents),
  onNewEvent: wsAuthenticatedProcedure.input(wssAuthSchema()).subscription(onNewEvent),
})
