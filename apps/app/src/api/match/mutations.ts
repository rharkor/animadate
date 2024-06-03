import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { getContext } from "@/lib/utils/events"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { PET_ACTION } from "@animadate/app-db/generated/client"
import events from "@animadate/events-sdk"

import { onMatchResponseSchema, petActionResponseSchema, petActionSchema } from "./schemas"

export const petAction = async ({ ctx: { session, req }, input }: apiInputFromSchema<typeof petActionSchema>) => {
  try {
    ensureLoggedIn(session)

    const { petId, action } = input

    const sessionPet = await prisma.pet.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    if (!sessionPet)
      return ApiError("pleaseConfigureYourPetProfile", "NOT_FOUND", {
        redirect: "/profile/pet-profile",
      })

    let petAction: PET_ACTION | null = null
    if (action === "like") {
      petAction = PET_ACTION.LIKE
    }
    if (action === "dismiss") {
      petAction = PET_ACTION.DISMISS
    }
    if (!petAction) return ApiError("invalidAction", "BAD_REQUEST")

    //? Upsert because action can be overridden
    await prisma.petAction.upsert({
      where: {
        sourcePetId_targetPetId: {
          sourcePetId: sessionPet.id,
          targetPetId: petId,
        },
      },
      create: {
        sourcePetId: sessionPet.id,
        targetPetId: petId,
        action: petAction,
      },
      update: {
        action: petAction,
      },
    })
    events.push({
      name: "petAction",
      kind: "MATCH",
      level: "INFO",
      context: getContext({ req, session: null }),
      data: {
        sourcePetId: sessionPet.id,
        targetPetId: petId,
        action: petAction,
      },
    })

    if (petAction === "LIKE") {
      //? Is it a match
      const targetPetAction = await prisma.petAction.findUnique({
        where: {
          sourcePetId_targetPetId: {
            sourcePetId: petId,
            targetPetId: sessionPet.id,
          },
          action: PET_ACTION.LIKE,
        },
      })

      if (targetPetAction) {
        //? Was it already a match
        const match = await prisma.match.findFirst({
          where: {
            OR: [
              {
                petId1: sessionPet.id,
                petId2: petId,
              },
              {
                petId1: petId,
                petId2: sessionPet.id,
              },
            ],
          },
        })
        if (!match) {
          //? Create the match
          const newMatch = await prisma.match.create({
            data: {
              petId1: sessionPet.id,
              petId2: petId,
            },
          })
          events.push({
            name: "match",
            kind: "MATCH",
            level: "INFO",
            context: getContext({ req, session: null }),
            data: {
              petId1: sessionPet.id,
              petId2: petId,
              matchId: newMatch.id,
            },
          })

          //? Propagate the match to wss
          const pet = await prisma.pet.findFirst({
            where: {
              id: petId,
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
          await redis.connect().catch(() => {})
          const data = onMatchResponseSchema().parse({
            pet,
          })
          const channel = `on-match:${sessionPet.id}`
          await redis.publish(channel, JSON.stringify(data))
        }
      }
    }

    const res: z.infer<ReturnType<typeof petActionResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
