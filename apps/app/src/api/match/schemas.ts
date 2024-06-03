import { z } from "zod"

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
