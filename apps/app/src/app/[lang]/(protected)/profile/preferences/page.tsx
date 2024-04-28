import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import LocaleSwitcher from "@/components/locale-switcher"
import { fontSans } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Button } from "@nextui-org/button"

import { containerClassName } from "../utils"

export default async function Preferences({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements({
      preferences: true,
      back: true,
      language: true,
      lang: true,
    })
  )

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
        <h1 className={cn("text-xl md:text-3xl", fontSans.className)}>{dictionary.preferences}</h1>
        <div className="flex flex-col gap-2">
          <h3 className="text-medium font-medium">{dictionary.language}</h3>
          <LocaleSwitcher lang={dictionary.lang as Locale} size="lg" className="w-full max-w-[250px]" />
        </div>
      </div>
    </main>
  )
}
