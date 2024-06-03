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

  const suggestedLimit = 10
  const suggested = await serverTrpc.match.getSuggestedPets({
    limit: suggestedLimit,
    alreadyLoaded: [],
    enableInfiniteRadius: false,
  })

  return (
    <main className="flex size-full flex-1 flex-col justify-center gap-4 overflow-hidden p-3">
      <MatchProvider initialData={suggested} suggestedLimit={suggestedLimit}>
        <Match dictionary={dictionary} />
      </MatchProvider>
    </main>
  )
}
