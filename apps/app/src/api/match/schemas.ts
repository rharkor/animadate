import { z } from "zod"

import { petProfileSchema } from "../pet/schemas"

export const getSuggestedPetsSchema = () =>
  z.object({
    limit: z.number().min(3).max(10).default(10),
    cursor: z.string().nullish(),
  })

export const getSuggestedPetsResponseSchema = () =>
  z.object({
    pets: z.array(petProfileSchema()),
    nextCursor: z.string().nullish(),
  })
