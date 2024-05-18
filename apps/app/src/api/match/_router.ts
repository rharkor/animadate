import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { getSuggestedPets } from "./queries"
import { getSuggestedPetsResponseSchema, getSuggestedPetsSchema } from "./schemas"

export const matchRouter = router({
  getSuggestedPets: authenticatedProcedure
    .input(getSuggestedPetsSchema())
    .output(getSuggestedPetsResponseSchema())
    .query(getSuggestedPets),
})
