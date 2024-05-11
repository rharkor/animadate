import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getPetProfileResponseSchema, getPetProfileSchema } from "./schemas"

export const getPetProfile = async ({ ctx: { session } }: apiInputFromSchema<typeof getPetProfileSchema>) => {
  try {
    ensureLoggedIn(session)

    const petProfile = await prisma.pet.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        photos: {
          orderBy: {
            order: "asc",
          },
        },
        characteristics: true,
      },
    })
    if (!petProfile) return ApiError("petNotFound", "NOT_FOUND")
    const data: z.infer<ReturnType<typeof getPetProfileResponseSchema>> = petProfile
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
