import { z } from "zod"

import { getAccountResponseSchema } from "@/api/me/schemas"
import { useIsSigningOut } from "@/contexts/signing-out/utils"
import { trpc } from "@/lib/trpc/client"

export function useAccount(extendedOptions?: { initialData?: z.infer<ReturnType<typeof getAccountResponseSchema>> }) {
  const { isSigningOut } = useIsSigningOut()
  const account = trpc.me.getAccount.useQuery(undefined, {
    initialData: extendedOptions?.initialData,
    enabled: !isSigningOut,
  })
  return account
}
