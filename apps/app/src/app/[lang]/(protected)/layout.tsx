import requireAuth from "@/components/auth/require-auth"
import BottomBar from "@/components/navigation/bottom-bar"
import { BottomBarDr } from "@/components/navigation/bottom-bar.dr"
import { lastLocaleExpirationInSeconds } from "@/constants"
import SigningOutProvider from "@/contexts/signing-out/provider"
import VerifyEmailProvider from "@/contexts/verify-email/provider"
import { VerifyEmailDr } from "@/contexts/verify-email/verify-email.dr"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

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

  //* Set last locale
  // Get last locale from redis or db
  const getLastLocale = async () => {
    const lastLocale = await redis.get(`lastLocale:${session.user.id}`)
    if (lastLocale) {
      return lastLocale
    }
    const lastLocaleFromDb = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastLocale: true },
    })
    if (lastLocaleFromDb && lastLocaleFromDb.lastLocale) {
      await redis.setex(`lastLocale:${session.user.id}`, lastLocaleExpirationInSeconds, lastLocaleFromDb.lastLocale)
      return lastLocaleFromDb.lastLocale
    }
    return null
  }
  // Set last locale in redis and db
  const setLastLocale = async (locale: Locale) => {
    await redis.setex(`lastLocale:${session.user.id}`, lastLocaleExpirationInSeconds, locale)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastLocale: locale },
    })
  }

  const lastLocale = await getLastLocale()
  if (lastLocale !== lang) {
    await setLastLocale(lang)
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
