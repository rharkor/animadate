import { headers } from "next/headers"
import { redirect } from "next/navigation"

import requireAuth from "@/components/auth/require-auth"
import SideBar from "@/components/navigation/side-bar"
import { SideBarDr } from "@/components/navigation/side-bar.dr"
import { rolesAsObject } from "@/constants"
import SigningOutProvider from "@/contexts/signing-out/provider"
import VerifyEmailProvider from "@/contexts/verify-email/provider"
import { VerifyEmailDr } from "@/contexts/verify-email/verify-email.dr"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { getLastLocale, setLastLocale } from "@/lib/utils/last-locale"

export default async function ProtectedLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: {
    lang: Locale
  }
}) {
  const session = await requireAuth()
  const account = await serverTrpc.me.getAccount()

  const lastLocale = await getLastLocale(session.user.id)
  if (lastLocale !== lang) {
    await setLastLocale(session.user.id, lang)
  }

  const dictionary = await getDictionary(lang, dictionaryRequirements(SideBarDr, VerifyEmailDr))

  const emailNotVerified = account.user.emailVerified === null
  const hasPetProfile = account.user.hasPetProfile

  const headersStore = headers()
  if (!account.user.hasPetProfile && account.user.role !== rolesAsObject.admin) {
    const pathname = headersStore.get("x-url")
    const petProfilePath = "/profile/pet-profile"
    if (!pathname?.includes(petProfilePath)) redirect(petProfilePath + "?onSuccess=/")
  }

  return (
    <SigningOutProvider>
      <VerifyEmailProvider
        dictionary={dictionary}
        emailNotVerifiedSSR={emailNotVerified}
        hasPetProfileSSR={hasPetProfile}
      >
        <SideBar dictionary={dictionary} />
        <main className="container mx-auto flex flex-1 flex-col gap-3 px-3 py-5 max-lg:mt-12">{children}</main>
      </VerifyEmailProvider>
    </SigningOutProvider>
  )
}
