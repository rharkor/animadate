import { useIsSigningOut } from "@/contexts/signing-out/utils"
import { trpc } from "@/lib/trpc/client"

export function useAccount(extendedOptions?: Parameters<typeof trpc.me.getAccount.useQuery>["1"]) {
  const { isSigningOut } = useIsSigningOut()
  const account = trpc.me.getAccount.useQuery(undefined, {
    enabled: !isSigningOut,
    initialData: extendedOptions?.initialData,
  })
  return account
}
