import { headers } from "next/headers"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import EmailContactsTable from "./table"
import { EmailContactsTableDr } from "./table.dr"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  // Required due to the use of serverTrpc
  headers()

  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements({ emailContacts: true, emailContactsDescription: true }, EmailContactsTableDr)
  )

  const page = 1
  const perPage = 10
  const emailsContacts = await serverTrpc.emailContacts.getEmailContacts({
    page,
    perPage,
    email: "",
  })

  return (
    <>
      <div>
        <h1 className={cn("text-2xl font-medium")}>{dictionary.emailContacts}</h1>
        <p className="text-muted-foreground">{dictionary.emailContactsDescription}</p>
      </div>
      <EmailContactsTable
        dictionary={dictionary}
        ssrData={emailsContacts}
        defaultPage={page}
        defaultPerPage={perPage}
      />
    </>
  )
}
