import { getServerSession } from "next-auth"
import { ChevronLeft } from "lucide-react"

import { nextAuthOptions } from "@/lib/auth"
import { fontSans } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Link } from "@nextui-org/link"

import NeedHelpForm from "./form"
import { NeedHelpFormDr } from "./form.dr"

export default async function NeedHelp({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        needHelp: true,
        back: true,
      },
      NeedHelpFormDr
    )
  )

  const session = await getServerSession(nextAuthOptions)

  return (
    <main className={cn("container m-auto flex-1 overflow-auto p-3")}>
      <div className="mx-auto flex flex-col gap-3 sm:max-w-lg">
        <Link href={"/profile"}>
          <ChevronLeft className="mr-2 size-4" />
          {dictionary.back}
        </Link>
        <h1 className={cn("text-xl md:text-3xl", fontSans.className)}>{dictionary.needHelp}</h1>
        <NeedHelpForm dictionary={dictionary} ssrSession={session} lang={lang} />
      </div>
    </main>
  )
}
