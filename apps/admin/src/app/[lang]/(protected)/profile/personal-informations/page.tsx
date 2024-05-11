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

import ChangeEmail from "../change-email"
import { ChangeEmailDr } from "../change-email.dr"
import ChangePassword from "../change-password"
import { ChangePasswordDr } from "../change-password.dr"
import Section from "../section"
import { containerClassName } from "../utils"

import UpdatePersonalInformations from "./update"
import { UpdatePersonalInformationsDr } from "./update.dr"

export default async function PersonalInformations({
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
    dictionaryRequirements(
      {
        back: true,
        personalInformations: true,
        security: true,
      },
      UpdatePersonalInformationsDr,
      ChangeEmailDr,
      ChangePasswordDr
    )
  )

  const account = await serverTrpc.me.getAccount()

  return (
    <main className={cn("container m-auto flex-1 overflow-auto p-3")}>
      <section className={containerClassName}>
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
        <h1 className={cn("text-xl md:text-3xl", fontSans.className)}>{dictionary.personalInformations}</h1>
        <UpdatePersonalInformations dictionary={dictionary} ssrAccount={account} />
        <Section title={dictionary.security}>
          <ChangeEmail dictionary={dictionary} ssrEmail={account.user.email} placement="top" />
          <ChangePassword dictionary={dictionary} placement="bottom" />
        </Section>
      </section>
    </main>
  )
}
