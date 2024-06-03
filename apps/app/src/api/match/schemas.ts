import { z } from "zod"

import { wssAuthSchema } from "@/schemas/auth"

import { petProfileSchema } from "../pet/schemas"

export const getSuggestedPetsSchema = () =>
  z.object({
    limit: z.number().min(3).max(10).default(10),
    alreadyLoaded: z.array(z.string()),
    enableInfiniteRadius: z.boolean(),
  })

export const getSuggestedPetsResponseSchema = () =>
  z.object({
    pets: z.array(
      petProfileSchema().extend({
        distance: z.number().nullable(),
      })
    ),
  })

export const petActionSchema = () =>
  z.object({
    petId: z.string(),
    action: z.enum(["like", "dismiss"]),
  })

export const petActionResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const onMatchSchema = () =>
  wssAuthSchema().extend({
    petId: z.string(),
  })

export const onMatchResponseSchema = () =>
  z.object({
    pet: petProfileSchema(),
  })
