import { headers } from "next/headers"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import Match from "./(match)/match"
import { MatchDr } from "./(match)/match.dr"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  // Required due to the use of serverTrpc
  headers()

  const dictionary = await getDictionary(lang, dictionaryRequirements({}, MatchDr))

  const suggested = await serverTrpc.match.getSuggestedPets({})

  return (
    <main className="container m-auto flex flex-1 flex-col items-center justify-center gap-3">
      <Match ssrSuggested={suggested} dictionary={dictionary} />
    </main>
  )
}
