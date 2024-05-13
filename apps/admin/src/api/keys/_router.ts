import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { createApiKey, deleteApiKey } from "./mutations"
import { getApiKeys } from "./queries"
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  deleteApiKeyResponseSchema,
  deleteApiKeySchema,
  getApiKeysResponseSchema,
  getApiKeysSchema,
} from "./schemas"

export const keysRouter = router({
  createApiKey: authenticatedProcedure
    .input(createApiKeySchema())
    .output(createApiKeyResponseSchema())
    .mutation(createApiKey),
  deleteApiKey: authenticatedProcedure
    .input(deleteApiKeySchema())
    .output(deleteApiKeyResponseSchema())
    .mutation(deleteApiKey),
  getApiKeys: authenticatedProcedure.input(getApiKeysSchema()).output(getApiKeysResponseSchema()).query(getApiKeys),
})
