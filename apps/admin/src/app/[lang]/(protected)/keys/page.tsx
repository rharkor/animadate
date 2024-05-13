import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import AddKey from "./add-key"
import { AddKeyDr } from "./add-key.dr"
import KeysTable from "./table"
import { KeysTableDr } from "./table.dr"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang, dictionaryRequirements({ manageApiKeys: true }, KeysTableDr, AddKeyDr))

  const page = 1
  const perPage = 10
  const sort = [
    {
      field: "lastUsedAt",
      direction: "desc",
    } as const,
  ]
  const keys = await serverTrpc.keys.getApiKeys({
    page,
    perPage,
    sort,
  })

  return (
    <>
      <h1 className={cn("text-2xl font-medium")}>{dictionary.manageApiKeys}</h1>
      <AddKey dictionary={dictionary} />
      <KeysTable
        dictionary={dictionary}
        ssrData={keys}
        defaultSort={sort}
        defaultPage={page}
        defaultPerPage={perPage}
      />
    </>
  )
}
