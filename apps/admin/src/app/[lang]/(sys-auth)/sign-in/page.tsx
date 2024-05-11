import { LoginUserAuthForm } from "@/components/auth/login-user-auth-form"
import { LoginUserAuthFormDr } from "@/components/auth/login-user-auth-form.dr"
import LogoVideoCPath from "@/components/auth/logo-video-cpath"
import Logo from "@/components/logo"
import { portraitLink, portraitPosterLink } from "@/constants/medias"
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
    <main className="container mx-auto flex flex-1 flex-col items-center justify-between gap-8 px-3 py-8 md:flex-row md:justify-center md:gap-2">
      <div className="fixed left-0 top-0 z-0 min-h-full min-w-full blur-[2px] md:hidden">
        <video
          autoPlay
          muted
          loop
          className="min-w-screen absolute min-h-screen scale-105 bg-default-600 object-cover"
          poster={portraitPosterLink}
        >
          <source src={portraitLink} type="video/mp4" />
        </video>
        <div
          className={cn(
            "absolute inset-0 z-[1] bg-gradient-to-b from-foreground/0 to-foreground/60",
            "via-foreground/0 via-40% to-80%",
            "scale-105"
          )}
        ></div>
      </div>
      <div className="z-10 my-8 flex flex-col items-center gap-1 md:hidden">
        <Logo className="size-20 md:size-16" />
        <h2 className={cn("text-2xl font-medium text-slate-50 md:hidden md:text-xl", fontMono.className)}>
          {dictionary.name}
        </h2>
      </div>
      <div className="z-10 flex flex-col max-sm:w-full md:flex-1 md:items-center">
        <h1 className={cn("text-2xl font-semibold text-slate-50 md:text-4xl md:text-foreground", fontMono.className)}>
          {dictionary.signInPage.loginToYourAccount}
        </h1>
        <LoginUserAuthForm dictionary={dictionary} searchParams={searchParams} />
      </div>
      <LogoVideoCPath className="hidden flex-1 md:block" />
    </main>
  )
}
