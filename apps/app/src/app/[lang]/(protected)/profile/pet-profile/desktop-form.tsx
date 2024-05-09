"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

import { DesktopFormDr } from "./desktop-form.dr"

export default function DesktopForm({
  dictionary,
  hasPetProfile,
}: {
  dictionary: TDictionary<typeof DesktopFormDr>
  hasPetProfile: boolean
}) {
  return (
    <section className="flex flex-1 flex-col gap-3 p-3 max-lg:hidden">
      <Button
        as={Link}
        href={"/profile"}
        variant="flat"
        className={cn("z-[70] w-max max-lg:hidden", {
          hidden: !hasPetProfile,
        })}
        size="sm"
        startContent={<ChevronLeft className="size-4" />}
      >
        {dictionary.back}
      </Button>
      Hello
    </section>
  )
}
