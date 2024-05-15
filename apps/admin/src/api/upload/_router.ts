import { authenticatedNoEmailVerificationProcedure, router } from "@/lib/server/trpc"

import { presignedUrl } from "./mutations"
import { presignedUrlResponseSchema, presignedUrlSchema } from "./schemas"

export const uploadRouter = router({
  presignedUrl: authenticatedNoEmailVerificationProcedure
    .input(presignedUrlSchema())
    .output(presignedUrlResponseSchema())
    .mutation(presignedUrl),
})
