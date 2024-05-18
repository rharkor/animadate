"use client"

import { Heart, X } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Button } from "@nextui-org/react"

import { MatchDr } from "./match.dr"
import { useMatch } from "./match-context"
import MatchProfile from "./match-profile"

export default function Match({ dictionary }: { dictionary: TDictionary<typeof MatchDr> }) {
  const { suggested, dismiss, like } = useMatch()

  return (
    <>
      <section className="relative flex-1 rounded-medium shadow-xl">
        {suggested.map((pet, i) => (
          <MatchProfile
            key={pet.id}
            suggested={pet}
            dictionary={dictionary}
            style={{
              zIndex: suggested.length - i + 1,
            }}
          />
        ))}
      </section>
      <div className="flex justify-center gap-4">
        <Button className="h-max min-w-0 rounded-full bg-white p-4 text-danger shadow" onPress={dismiss}>
          <X className="size-8" strokeWidth={3} />
        </Button>
        <Button className="h-max min-w-0 rounded-full bg-white p-4 text-primary shadow" onPress={like}>
          <Heart className="size-8 fill-current" strokeWidth={3} />
        </Button>
      </div>
    </>
  )
}
