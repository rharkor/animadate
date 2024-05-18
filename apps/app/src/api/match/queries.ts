import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getSuggestedPetsResponseSchema, getSuggestedPetsSchema } from "./schemas"

export const getSuggestedPets = async ({
  ctx: { session },
  input,
}: apiInputFromSchema<typeof getSuggestedPetsSchema>) => {
  try {
    ensureLoggedIn(session)

    const { limit, cursor } = input

    // This cursor will be changed based on the match algorithm
    const cursorKey = "id"

    const petProfile = await prisma.pet.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })
    if (!petProfile) return ApiError("pleaseConfigureYourPetProfile", "NOT_FOUND")

    const pets = await prisma.pet.findMany({
      where: {
        ownerId: {
          not: session.user.id,
        },
      },
      include: {
        photos: {
          orderBy: {
            order: "asc",
          },
        },
        characteristics: true,
      },
      take: limit + 1, // get an extra item at the end which we'll use as next cursor
      cursor: cursor ? { [cursorKey]: cursor } : undefined,
      orderBy: {
        [cursorKey]: "asc",
      },
    })

    let nextCursor: typeof cursor | undefined = undefined
    if (pets.length > limit) {
      const nextItem = pets.pop()
      nextCursor = nextItem![cursorKey]
    }

    const data: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>> = { pets, nextCursor }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
