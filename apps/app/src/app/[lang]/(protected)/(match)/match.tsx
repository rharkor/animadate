"use client"

import { useState } from "react"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

import { MatchDr } from "./match.dr"
import MatchProfile from "./match-profile"

export default function Match({
  ssrSuggested,
  dictionary,
}: {
  ssrSuggested: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>
  dictionary: TDictionary<typeof MatchDr>
}) {
  const suggested = trpc.match.getSuggestedPets.useQuery(
    {},
    {
      initialData: ssrSuggested,
    }
  )
  const [profiles, setProfiles] = useState<z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"]>(
    suggested.data.pets.slice(0, 2)
  )

  return (
    <>
      <section className="relative size-full">
        {profiles.map((pet, i) => (
          <MatchProfile
            key={pet.id}
            suggested={pet}
            dictionary={dictionary}
            className={cn("absolute inset-0")}
            style={{
              zIndex: suggested.data.pets.length - i + 1,
            }}
          />
        ))}
      </section>
    </>
  )
}
