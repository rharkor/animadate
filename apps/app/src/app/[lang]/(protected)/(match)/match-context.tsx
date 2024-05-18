"use client"

import { createContext, useContext, useState } from "react"
import { AnimationControls, useAnimation } from "framer-motion"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import { trpc } from "@/lib/trpc/client"

type MatchContextType = {
  like: () => Promise<void>
  dismiss: () => Promise<void>
  suggested: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"]
  animate: AnimationControls
  currentPet: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"][number]
}

export const MatchContext = createContext<MatchContextType | undefined>(undefined)

export const MatchProvider = ({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>
}) => {
  const animate = useAnimation()

  const transitionLength = 350

  const suggestedQuery = trpc.match.getSuggestedPets.useQuery(
    {},
    {
      initialData,
    }
  )

  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(2)

  const suggested = suggestedQuery.data.pets.slice(start, end)

  const loadNext = async () => {
    if (end === suggestedQuery.data.pets.length) {
      // TODO: Handle end of list
      console.log("End of list")
    }
    //* Add a new pet to the list
    setEnd(end + 1)
    //* Remove the first pet from the list
    setStart(start + 1)
  }

  const like = async () => {
    console.log("like")
    await animate.start({ x: transitionLength })
    await loadNext()
  }

  const dismiss = async () => {
    console.log("dismiss")
    await animate.start({ x: -transitionLength })
    await loadNext()
  }

  const currentPet = suggested[0]

  return (
    <MatchContext.Provider value={{ like, dismiss, suggested, animate, currentPet }}>{children}</MatchContext.Provider>
  )
}

export const useMatch = () => {
  const context = useContext(MatchContext)
  if (context === undefined) {
    throw new Error("useMatch must be used within a MatchProvider")
  }
  return context
}
