"use client"

import { createContext, useContext, useState } from "react"
import { AnimationControls, useAnimation } from "framer-motion"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import { trpc } from "@/lib/trpc/client"

type MatchContextType = {
  like: () => Promise<void>
  canLike: boolean
  dismiss: () => Promise<void>
  canDismiss: boolean
  undo: () => Promise<void>
  canUndo: boolean
  suggested: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"]
  animate: AnimationControls
  currentPet: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"][number]
}

export const MatchContext = createContext<MatchContextType | undefined>(undefined)

const transitionLength = 350
const transitionDuration = 300
const preloadLength = 3

export const MatchProvider = ({
  children,
  initialData,
  suggestedLimit,
}: {
  children: React.ReactNode
  initialData: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>
  suggestedLimit: number
}) => {
  const animate = useAnimation()

  const suggestedQuery = trpc.match.getSuggestedPets.useInfiniteQuery(
    {
      limit: suggestedLimit,
    },
    {
      initialData: {
        pages: [initialData],
        pageParams: [null],
      },
      getNextPageParam(lastPage) {
        return lastPage.nextCursor
      },
    }
  )

  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(preloadLength)

  const fullSuggested = suggestedQuery.data?.pages
    .filter((_, i) => {
      //? Only keep the last 5 pages to avoid memory leaks
      return i >= suggestedQuery.data.pages.length - 5
    })
    .reduce<
      (z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"][number] & { action?: "like" | "dismiss" })[]
    >((acc, cur) => {
      acc.push(...cur.pets)
      return acc
    }, [])

  const suggested = fullSuggested?.slice(start, end) ?? []

  const loadNext = async () => {
    //* Preload more pets
    if (fullSuggested && end + 1 >= fullSuggested?.length) {
      await suggestedQuery.fetchNextPage()
    }
    //* Add a new pet to the list
    setEnd(end + 1)
    //* Remove the first pet from the list
    setStart(start + 1)
  }

  const [lastActionRateLimit, setLastActionRateLimit] = useState<boolean>(false)

  const canLike = suggested.length > 0 && !lastActionRateLimit
  const like = async () => {
    if (!canLike) return
    setLastActionRateLimit(true)
    setTimeout(() => setLastActionRateLimit(false), transitionDuration)
    await animate.start({ x: transitionLength })
    const current = suggested[0]
    current.action = "like"
    await loadNext()
  }

  const canDismiss = suggested.length > 0 && !lastActionRateLimit
  const dismiss = async () => {
    if (!canDismiss) return
    setLastActionRateLimit(true)
    setTimeout(() => setLastActionRateLimit(false), transitionDuration)
    await animate.start({ x: -transitionLength })
    const current = suggested[0]
    current.action = "dismiss"
    await loadNext()
  }

  const canUndo = start > 0 && fullSuggested?.at(start - 1) !== undefined && !lastActionRateLimit
  const undo = async () => {
    if (!canUndo) return
    setLastActionRateLimit(true)
    setTimeout(() => setLastActionRateLimit(false), transitionDuration)
    setEnd(end - 1)
    setStart(start - 1)
  }

  const currentPet = suggested[0]

  return (
    <MatchContext.Provider
      value={{ like, canLike, dismiss, canDismiss, undo, canUndo, suggested, animate, currentPet }}
    >
      {children}
    </MatchContext.Provider>
  )
}

export const useMatch = () => {
  const context = useContext(MatchContext)
  if (context === undefined) {
    throw new Error("useMatch must be used within a MatchProvider")
  }
  return context
}
