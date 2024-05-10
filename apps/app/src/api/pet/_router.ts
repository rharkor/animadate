import { authenticatedNoEmailVerificationProcedure, router } from "@/lib/server/trpc"

import { upsertPet } from "./mutations"
import { getPetProfile } from "./queries"
import { getPetProfileResponseSchema, getPetProfileSchema, upsertPetResponseSchema, upsertPetSchema } from "./schemas"

export const petRouter = router({
  // No email verification because the users will specify the pet profile before verifying their email
  upsertPet: authenticatedNoEmailVerificationProcedure
    .input(upsertPetSchema())
    .output(upsertPetResponseSchema())
    .mutation(upsertPet),
  getPetProfile: authenticatedNoEmailVerificationProcedure
    .input(getPetProfileSchema())
    .output(getPetProfileResponseSchema())
    .query(getPetProfile),
})
