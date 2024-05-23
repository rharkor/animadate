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
  transitionDuration: number
}

export const MatchContext = createContext<MatchContextType | undefined>(undefined)

const transitionLength = 350
const transitionDuration = 0.2
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

  const [rStart, setRStart] = useState(0)
  const [rEnd, setREnd] = useState(preloadLength)

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
    //* Add a new pet to the list
    setEnd(end + 1)
    //* Remove the first pet from the list
    setStart(start + 1)
    //* Preload more pets
    if (fullSuggested && end + 1 >= fullSuggested?.length) {
      await suggestedQuery.fetchNextPage()
    }
  }

  const [lastActionRateLimit, setLastActionRateLimit] = useState<boolean>(false)

  const canLike = (fullSuggested?.slice(rStart, rEnd) ?? []).length > 0
  const like = async () => {
    if (!canLike || lastActionRateLimit) return
    setLastActionRateLimit(true)
    setREnd(rEnd + 1)
    setRStart(rStart + 1)
    await animate.start({
      x: transitionLength,
      transition: {
        duration: transitionDuration,
      },
    })
    await loadNext()
    const current = suggested[0]
    current.action = "like"
    setLastActionRateLimit(false)
  }

  const canDismiss = (fullSuggested?.slice(rStart, rEnd) ?? []).length > 0
  const dismiss = async () => {
    if (!canDismiss || lastActionRateLimit) return
    setLastActionRateLimit(true)
    setREnd(rEnd + 1)
    setRStart(rStart + 1)
    await animate.start({
      x: -transitionLength,
      transition: {
        duration: transitionDuration,
      },
    })
    await loadNext()
    const current = suggested[0]
    current.action = "dismiss"
    setLastActionRateLimit(false)
  }

  const canUndo = rStart > 0 && fullSuggested?.at(rStart - 1) !== undefined
  const undo = async () => {
    if (!canUndo || lastActionRateLimit) return
    setLastActionRateLimit(true)
    setTimeout(() => setLastActionRateLimit(false), transitionDuration * 1000)
    setREnd(rEnd - 1)
    setRStart(rStart - 1)
    setEnd(end - 1)
    setStart(start - 1)
  }

  const currentPet = suggested[0]

  return (
    <MatchContext.Provider
      value={{ like, canLike, dismiss, canDismiss, undo, canUndo, suggested, animate, currentPet, transitionDuration }}
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
