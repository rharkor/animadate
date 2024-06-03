"use client"

import { createContext, useContext, useState } from "react"
import { useSession } from "next-auth/react"
import { AnimationControls, useAnimation } from "framer-motion"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import { getPetProfileResponseSchema } from "@/api/pet/schemas"
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
  seeMore: boolean
  setSeeMore: (value: boolean) => void
  reload: (seeMore?: boolean) => Promise<void>
}

export const MatchContext = createContext<MatchContextType | undefined>(undefined)

const transitionLength = 350
const transitionDuration = 0.2
const preloadLength = 3

export const MatchProvider = ({
  children,
  initialData,
  suggestedLimit,
  petProfile,
}: {
  children: React.ReactNode
  initialData: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>
  suggestedLimit: number
  petProfile: z.infer<ReturnType<typeof getPetProfileResponseSchema>>
}) => {
  const animate = useAnimation()

  const petProfileQuery = trpc.pet.getPetProfile.useQuery(
    {},
    {
      initialData: petProfile,
    }
  )
  const session = useSession()

  const [data, setData] = useState<z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"]>(initialData.pets)
  const [alreadyLoaded, setAlreadyLoaded] = useState<string[]>(initialData.pets.map((pet) => pet.id))
  const suggestedMutation = trpc.match.getSuggestedPets.useMutation()
  const [seeMore, setSeeMore] = useState(false)

  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(preloadLength)

  const [rStart, setRStart] = useState(0)
  const [rEnd, setREnd] = useState(preloadLength)

  const suggested = data.slice(start, end)

  const reload = async (_seeMore?: boolean) => {
    if (_seeMore !== undefined) setSeeMore(_seeMore)
    const enableInfiniteRadius = _seeMore || seeMore

    if (data.length - end < preloadLength && !suggestedMutation.isPending) {
      const newPets = await suggestedMutation.mutateAsync({
        limit: suggestedLimit,
        alreadyLoaded,
        enableInfiniteRadius,
      })

      // Max limit is 50 pets in the list
      //? Limit prevents the list from growing indefinitely
      const bufferLimit = 50
      const newAlreadyLoaded = [...alreadyLoaded, ...newPets.pets.map((pet) => pet.id)]
      const newData = [...data, ...newPets.pets]
      if (newData.length > bufferLimit) {
        // Remove the first pet from the list
        newData.shift()
        newAlreadyLoaded.shift()
        setStart((prev) => prev - 1)
        setEnd((prev) => prev - 1)
        setRStart((prev) => prev - 1)
        setREnd((prev) => prev - 1)
      }
      setAlreadyLoaded(newAlreadyLoaded)
      setData(newData)
    }
  }

  const loadNext = async () => {
    //* Add a new pet to the list
    setEnd(end + 1)
    //* Remove the first pet from the list
    setStart(start + 1)
    //* Preload more pets
    await reload()
  }

  const [lastActionRateLimit, setLastActionRateLimit] = useState<boolean>(false)

  const currentPet = suggested[0]
  const petActionMutation = trpc.match.petAction.useMutation()

  const canLike = suggested.length > 0
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
    setLastActionRateLimit(false)
    await petActionMutation.mutateAsync({
      petId: currentPet.id,
      action: "like",
    })
    await loadNext()
  }

  const canDismiss = suggested.length > 0
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
    setLastActionRateLimit(false)
    await petActionMutation.mutateAsync({
      petId: currentPet.id,
      action: "dismiss",
    })
    await loadNext()
  }

  const canUndo = rStart > 0 && data.at(rStart - 1) !== undefined
  const undo = async () => {
    if (!canUndo || lastActionRateLimit) return
    setLastActionRateLimit(true)
    setTimeout(() => setLastActionRateLimit(false), transitionDuration * 1000)
    setREnd(rEnd - 1)
    setRStart(rStart - 1)
    setEnd(end - 1)
    setStart(start - 1)
  }

  trpc.match.onMatch.useSubscription(
    {
      userId: session.data?.user?.id ?? "",
      uuid: session.data?.user?.uuid ?? "",
      petId: petProfileQuery.data.id ?? "",
    },
    {
      enabled: !!petProfileQuery.data && !!session.data && !!session.data.user,
      onData: async (data) => {
        console.log(data)
      },
    }
  )

  return (
    <MatchContext.Provider
      value={{
        like,
        canLike,
        dismiss,
        canDismiss,
        undo,
        canUndo,
        suggested,
        animate,
        currentPet,
        transitionDuration,
        seeMore,
        setSeeMore,
        reload,
      }}
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
