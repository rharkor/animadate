"use client"

import { Heart, Undo, X } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

import { MatchDr } from "./match.dr"
import { useMatch } from "./match-context"
import MatchProfile from "./match-profile"

export default function Match({ dictionary }: { dictionary: TDictionary<typeof MatchDr> }) {
  const { suggested, dismiss, canDismiss, like, canLike, undo, canUndo } = useMatch()

  return (
    <>
      <section className={cn("relative flex-1 rounded-medium")}>
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
      <div className="flex items-center justify-center gap-4">
        <Button
          isDisabled={!canUndo}
          className="h-max min-w-0 rounded-full bg-white p-3 text-warning shadow"
          onPress={undo}
        >
          <Undo className="size-6" strokeWidth={3} />
        </Button>
        <Button
          isDisabled={!canDismiss}
          className="h-max min-w-0 rounded-full bg-white p-4 text-danger shadow"
          onPress={dismiss}
        >
          <X className="size-8" strokeWidth={3} />
        </Button>
        <Button
          isDisabled={!canLike}
          className="h-max min-w-0 rounded-full bg-white p-4 text-primary shadow"
          onPress={like}
        >
          <Heart className="size-8 fill-current" strokeWidth={3} />
        </Button>
        <div className="size-12" />
      </div>
    </>
  )
}
