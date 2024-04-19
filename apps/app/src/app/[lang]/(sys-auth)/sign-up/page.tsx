import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { RegisterUserAuthFormDr } from "@/components/auth/register-user-auth-form.dr"
import Logo from "@/components/logo"
import { fontMono } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PrivacyAcceptanceDr } from "../privacy-acceptance.dr"

const landscapeLink = "https://animadate-public.s3.fr-par.scw.cloud/dogs/landscape.mp4"
const portraitLink = "https://animadate-public.s3.fr-par.scw.cloud/dogs/portrait.mp4"

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
    <main className="container flex min-h-dvh flex-1 flex-col items-center justify-between gap-6 px-2 py-8">
      <div className="fixed left-0 top-0 z-0 min-h-full min-w-full blur-[2px]">
        <video autoPlay muted loop className="min-w-screen absolute min-h-screen scale-105 object-cover">
          <source src={portraitLink} type="video/mp4" />
        </video>
        <div
          className={cn(
            "absolute inset-0 z-[1] bg-gradient-to-b from-foreground/0 to-foreground/60",
            "via-foreground/0 via-40% to-80%"
          )}
        ></div>
      </div>
      <div className="z-10 my-8 flex flex-col items-center gap-1">
        <Logo className="size-12" />
        <h2 className={cn("text-xl font-medium", fontMono.className)}>{dictionary.name}</h2>
      </div>
      <div className="z-10 flex w-full flex-col space-y-2">
        <h1 className={cn("text-2xl font-semibold text-slate-50", fontMono.className)}>
          {dictionary.signUpPage.createAnAccount}
        </h1>
        <RegisterUserAuthForm dictionary={dictionary} searchParams={searchParams} locale={lang} />
      </div>
    </main>
  )
}
