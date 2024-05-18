"use client"

import { useRef } from "react"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import ChipsContainer from "@/components/pet/chips-container"
import PetProfilePhotos from "@/components/pet/photos"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"

import { MatchProfileDr } from "./match-profile.dr"

const getAge = (birthdate: Date) => {
  const today = new Date()
  if (isNaN(birthdate.getTime())) return 0
  return today.getFullYear() - birthdate.getFullYear()
}

const getDescription = (description: string) => {
  description +=
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias quaerat unde nihil blanditiis illum quasi excepturi odio? Accusantium, provident explicabo eaque aspernatur veniam minima adipisci iusto tempora, repudiandae amet atque?"

  // Max characters
  const maxChars = 170
  if (description.length > maxChars) {
    description = description.slice(0, maxChars) + "..."
  }
  // Max lines
  const maxLines = 4
  const lines = description.split("\n")
  if (lines.length > maxLines) {
    description = lines.slice(0, maxLines).join("\n") + "..."
  }
  return description
}

export default function MatchProfile({
  dictionary,
  suggested,
  className,
  style,
}: {
  dictionary: TDictionary<typeof MatchProfileDr>
  suggested: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"][number]
  className?: string
  style?: React.CSSProperties
}) {
  const chipsContainer = useRef<HTMLDivElement>(null)

  const age = getAge(suggested.birthdate)
  const description = getDescription(suggested.description)

  return (
    <div
      className={cn(
        "relative flex size-full flex-col justify-end overflow-hidden bg-slate-100",
        "lg:h-[740px] lg:w-[360px]",
        className
      )}
      style={style}
    >
      <PetProfilePhotos
        photos={suggested.photos.map((p) => ({
          key: p.key,
          order: p.order,
          url: getImageUrl(p) ?? "",
        }))}
        dictionary={dictionary}
        isReadOnly
      />
      <div className="relative z-30">
        <div className="absolute inset-0 z-[-1] translate-y-[-30px] bg-gradient-to-b from-black/0 to-black/70 to-20%" />
        <ChipsContainer
          dictionary={dictionary}
          breed={suggested.breed}
          characteristics={suggested.characteristics.map((c) => c.value)}
          isReadOnly
          chipsContainer={chipsContainer}
        />
        <div className={cn("relative flex h-40 flex-col rounded-t-large bg-content1 p-3 shadow-medium")}>
          <div className="flex w-full flex-row items-center gap-2">
            <h3 className={"min-w-4 shrink-0 truncate text-2xl font-bold"}>{suggested.name}</h3>
            <span className="text-2xl text-muted-foreground">-</span>
            <div className="flex flex-row items-end gap-0.5">
              <p className="min-w-4 shrink-0 truncate text-2xl font-bold text-muted-foreground">{age}</p>
              <div className="py-1">{age > 1 ? dictionary.yos : dictionary.yo}</div>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="min-h-0 flex-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
