import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { getUsersInRadius, getUsersProfileWithPet, maxAdminRadius } from "@animadate/app-db/utils"

import { getProfilesLocationResponseSchema, getProfilesLocationSchema } from "./schemas"

export const getProfilesLocation = async ({ input }: apiInputFromSchema<typeof getProfilesLocationSchema>) => {
  try {
    const { latitude, longitude, radius } = input

    const users = await getUsersInRadius(prisma, {
      latitude,
      longitude,
      radius,
      maxRadius: maxAdminRadius,
    })

    const fullUsers = await getUsersProfileWithPet(
      users.map((user) => user.userId),
      prisma
    )
    const fullUsersById = fullUsers.reduce(
      (acc, user) => {
        acc[user.id] = user
        return acc
      },
      {} as Record<string, (typeof fullUsers)[number]>
    )
    const filledUsers = users
      .filter((user) => fullUsersById[user.userId])
      .map((user) => {
        const fullUser = fullUsersById[user.userId]
        return {
          ...fullUser,
          location: user.location,
        }
      })

    getProfilesLocationResponseSchema().parse(filledUsers)
    const res: z.infer<ReturnType<typeof getProfilesLocationResponseSchema>> = filledUsers
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
