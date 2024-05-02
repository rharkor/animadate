import { headers } from "next/headers"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { petProfileImagesPlaceholder } from "@/constants/medias"
import { fontSans } from "@/lib/fonts"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Button } from "@nextui-org/button"

import { containerClassName } from "../utils"

import PetProfile from "./pet-profile"
import { PetProfileDr } from "./pet-profile.dr"

export default async function PetProfilePage({
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
        petProfile: true,
      },
      PetProfileDr
    )
  )

  const account = await serverTrpc.me.getAccount()

  const defaultPhoto = Math.floor(Math.random() * petProfileImagesPlaceholder.length)

  return (
    <main className={cn("container m-auto flex-1 overflow-auto p-3")}>
      <section className={containerClassName}>
        <Button
          as={Link}
          href={"/profile"}
          variant="flat"
          className={cn("z-[70] w-max", {
            hidden: !account.user.hasPetProfile,
          })}
          size="sm"
          startContent={<ChevronLeft className="size-4" />}
        >
          {dictionary.back}
        </Button>
        <h1 className={cn("text-xl md:text-3xl", fontSans.className)}>{dictionary.petProfile}</h1>
        <PetProfile dictionary={dictionary} hasPetProfile={account.user.hasPetProfile} defaultPhoto={defaultPhoto} />
      </section>
    </main>
  )
}
