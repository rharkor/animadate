import { authenticatedNoEmailVerificationProcedure, router } from "@/lib/server/trpc"

import { upsertPet } from "./mutations"
import { upsertPetResponseSchema, upsertPetSchema } from "./schemas"

export const petRouter = router({
  upsertPet: authenticatedNoEmailVerificationProcedure
    .input(upsertPetSchema())
    .output(upsertPetResponseSchema())
    .mutation(upsertPet),
})
