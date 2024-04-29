import requireAuth from "@/components/auth/require-auth"
import BottomBar from "@/components/navigation/bottom-bar"
import { BottomBarDr } from "@/components/navigation/bottom-bar.dr"
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

  const dictionary = await getDictionary(lang, dictionaryRequirements(BottomBarDr, VerifyEmailDr))

  const emailNotVerified = account.user.emailVerified === null

  return (
    <SigningOutProvider>
      <VerifyEmailProvider dictionary={dictionary} emailNotVerifiedSSR={emailNotVerified}>
        {children}
        <BottomBar dictionary={dictionary} ssrAccount={account} />
      </VerifyEmailProvider>
    </SigningOutProvider>
  )
}
