import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { getSuggestedPets } from "./queries"
import { getSuggestedPetsResponseSchema, getSuggestedPetsSchema } from "./schemas"

export const matchRouter = router({
  getSuggestedPets: authenticatedProcedure
    .input(getSuggestedPetsSchema())
    .output(getSuggestedPetsResponseSchema())
    .mutation(getSuggestedPets), // Mark it as a mutation because it is simple for the frontend
})
