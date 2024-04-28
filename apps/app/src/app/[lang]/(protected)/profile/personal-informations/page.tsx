import { headers } from "next/headers"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { fontSans } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Button } from "@nextui-org/react"

import { containerClassName } from "../utils"

import UpdateAvatar from "./update-avatar"
import { UpdateAvatarDr } from "./update-avatar.dr"

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
      },
      UpdateAvatarDr
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
        <div>
          <UpdateAvatar dictionary={dictionary} ssrAccount={account} />
          <h2 className="mx-auto mt-2 text-center text-large">{account.user.name}</h2>
        </div>
      </section>
    </main>
  )
}
