import { headers } from "next/headers"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { fontSans } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Button } from "@nextui-org/button"

import { containerClassName } from "../utils"

import NeedHelpForm from "./form"
import { NeedHelpFormDr } from "./form.dr"

export default async function NeedHelp({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  headers()

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

  const account = await serverTrpc.me.getAccount()

  return (
    <main className={cn("container m-auto flex-1 overflow-auto p-3")}>
      <div className={containerClassName}>
        <Button
          as={Link}
          href={"/profile"}
          variant="flat"
          className="w-max"
          size="sm"
          startContent={<ChevronLeft className="size-4" />}
        >
          {dictionary.back}
        </Button>
        <h1 className={cn("text-xl md:text-3xl", fontSans.className)}>{dictionary.needHelp}</h1>
        <NeedHelpForm dictionary={dictionary} ssrAccount={account} lang={lang} />
      </div>
    </main>
  )
}
