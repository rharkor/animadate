import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { RegisterUserAuthFormDr } from "@/components/auth/register-user-auth-form.dr"
import Logo from "@/components/logo"
import { fontMono } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PrivacyAcceptanceDr } from "../privacy-acceptance.dr"

export default async function SignUpPage({
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
        name: true,
        login: true,
        signUpPage: {
          createAnAccount: true,
          enterEmail: true,
        },
        auth: {
          orContinueWith: true,
        },
      },
      PrivacyAcceptanceDr,
      RegisterUserAuthFormDr
    )
  )

  return (
    <main className="container flex min-h-dvh flex-1 flex-col items-center justify-between space-y-6 px-2 py-8">
      <div className="my-8 flex flex-col items-center gap-1">
        <Logo className="size-12" />
        <h2 className={cn("text-xl font-medium", fontMono.className)}>{dictionary.name}</h2>
      </div>
      <div className="flex w-full flex-col space-y-2">
        <h1 className={cn("text-2xl font-semibold", fontMono.className)}>{dictionary.signUpPage.createAnAccount}</h1>
        <RegisterUserAuthForm dictionary={dictionary} searchParams={searchParams} locale={lang} />
      </div>
    </main>
  )
}
