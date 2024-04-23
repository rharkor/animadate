import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import MinimizedProfile from "./minimized-profile"
import { MinimizedProfileDr } from "./minimized-profile.dr"

export default async function Profile({
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
        profile: true,
      },
      MinimizedProfileDr
    )
  )

  const account = await serverTrpc.me.getAccount()

  return (
    <main className="container m-auto flex flex-1 flex-col items-center gap-3 p-3">
      <h1 className="sr-only">{dictionary.profile}</h1>
      <MinimizedProfile dictionary={dictionary} ssrAccount={account} />
    </main>
  )
}
