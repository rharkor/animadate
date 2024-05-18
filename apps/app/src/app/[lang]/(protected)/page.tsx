import { headers } from "next/headers"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import Match from "./(match)/match"
import { MatchDr } from "./(match)/match.dr"
import { MatchProvider } from "./(match)/match-context"

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
    <main className="container flex flex-1 flex-col gap-4 p-3">
      <MatchProvider initialData={suggested}>
        <Match dictionary={dictionary} />
      </MatchProvider>
    </main>
  )
}
