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

    const { limit, alreadyLoaded } = input

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
        id: {
          notIn: alreadyLoaded,
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
      take: limit,
    })

    const data: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>> = { pets }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
