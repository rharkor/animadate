"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut } from "lucide-react"

import { authRoutes } from "@/constants/auth"
import { useIsSigningOut } from "@/contexts/signing-out/utils"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { logger } from "@animadate/lib"
import { Spinner } from "@nextui-org/react"

import Row from "./row"
import { SignOutDr } from "./sign-out.dr"

export default function SignOut({ dictionary }: { dictionary: TDictionary<typeof SignOutDr> }) {
  const session = useSession()
  const router = useRouter()

  const currentSession = session.data?.user.uuid

  const deleteSessionMutation = trpc.me.deleteSession.useMutation()

  const [signOutLoading, setSignOutLoading] = useState(false)
  const { setIsSigningOut } = useIsSigningOut()
  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutLoading(true)
    try {
      //? Before signing out, we want to delete the session from the server
      if (currentSession)
        await deleteSessionMutation.mutateAsync({
          id: currentSession,
        })
    } catch (e) {
      logger.error(e)
    }
    const signoutRes = await signOut({ callbackUrl: authRoutes.signIn[0], redirect: false })
    router.push(signoutRes.url)

    // Do not set signOutLoading to false, as the user will be redirected
    // setSignOutLoading(false)
  }

  return (
    <Row placement="center" className="text-danger hover:!bg-danger-100" color="danger" onPress={handleSignOut}>
      {signOutLoading ? (
        <Spinner classNames={{ wrapper: "size-5" }} color="current" size="sm" />
      ) : (
        <LogOut className="size-5" />
      )}
      {dictionary.signOut}
    </Row>
  )
}
