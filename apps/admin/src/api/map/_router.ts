import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { getProfilesLocation } from "./queries"
import { getProfilesLocationResponseSchema, getProfilesLocationSchema } from "./schemas"

export const mapRouter = router({
  getProfilesLocation: authenticatedProcedure
    .input(getProfilesLocationSchema())
    .output(getProfilesLocationResponseSchema())
    .mutation(getProfilesLocation),
})
