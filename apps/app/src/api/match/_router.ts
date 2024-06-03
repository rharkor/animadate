import { authenticatedProcedure, router, wsAuthenticatedProcedure } from "@/lib/server/trpc"

import { petAction } from "./mutations"
import { getSuggestedPets } from "./queries"
import {
  getSuggestedPetsResponseSchema,
  getSuggestedPetsSchema,
  onMatchSchema,
  petActionResponseSchema,
  petActionSchema,
} from "./schemas"
import { onMatch } from "./subscriptions"

export const matchRouter = router({
  getSuggestedPets: authenticatedProcedure
    .input(getSuggestedPetsSchema())
    .output(getSuggestedPetsResponseSchema())
    .mutation(getSuggestedPets), // Mark it as a mutation because it is simple for the frontend
  petAction: authenticatedProcedure.input(petActionSchema()).output(petActionResponseSchema()).mutation(petAction),
  onMatch: wsAuthenticatedProcedure.input(onMatchSchema()).subscription(onMatch),
})
