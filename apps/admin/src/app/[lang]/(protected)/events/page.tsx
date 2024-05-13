import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import EventsTable from "./table"
import { EventsTableDr } from "./table.dr"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang, dictionaryRequirements({ eventsList: true }, EventsTableDr))

  const page = 1
  const perPage = 10
  const events = await serverTrpc.events.getEvents({
    page,
    perPage,
  })

  return (
    <>
      <h1 className={cn("text-2xl font-medium")}>{dictionary.eventsList}</h1>
      <EventsTable dictionary={dictionary} ssrData={events} defaultPage={page} defaultPerPage={perPage} />
    </>
  )
}
