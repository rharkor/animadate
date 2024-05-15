import { LoginUserAuthForm } from "@/components/auth/login-user-auth-form"
import { LoginUserAuthFormDr } from "@/components/auth/login-user-auth-form.dr"
import { fontMono } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PrivacyAcceptanceDr } from "../privacy-acceptance.dr"

export default async function SignInPage({
  searchParams,
  params: { lang },
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        signInPage: {
          loginToYourAccount: true,
          enterDetails: true,
        },
        toSignUp: true,
        auth: {
          orContinueWith: true,
        },
        name: true,
      },
      PrivacyAcceptanceDr,
      LoginUserAuthFormDr
    )
  )
  return (
    <main className="container mx-auto flex flex-1 flex-col items-center justify-center gap-2 px-3 py-8">
      <h1 className={cn("text-2xl font-semibold text-slate-50 md:text-4xl md:text-foreground", fontMono.className)}>
        {dictionary.signInPage.loginToYourAccount}
      </h1>
      <LoginUserAuthForm dictionary={dictionary} searchParams={searchParams} />
    </main>
  )
}
