import { headers } from "next/headers"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { kinds as sdkKinds, levels as sdkLevels } from "@animadate/events-sdk/dist/sdk/types"

import EventsTable from "./table"
import { EventsTableDr } from "./table.dr"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  // Required due to the use of serverTrpc
  headers()

  const dictionary = await getDictionary(lang, dictionaryRequirements({ eventsList: true }, EventsTableDr))

  const page = 1
  const perPage = 10
  const kinds = [...sdkKinds]
  const levels = [...sdkLevels]
  const events = await serverTrpc.events.getEvents({
    page,
    perPage,
    kinds,
    levels,
    name: "",
    application: "",
  })

  return (
    <>
      <h1 className={cn("text-2xl font-medium")}>{dictionary.eventsList}</h1>
      <EventsTable
        dictionary={dictionary}
        ssrData={events}
        defaultPage={page}
        defaultPerPage={perPage}
        defaultKinds={kinds}
        defaultLevels={levels}
      />
    </>
  )
}
