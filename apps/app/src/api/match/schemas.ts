import { z } from "zod"

import { petProfileSchema } from "../pet/schemas"

export const getSuggestedPetsSchema = () => z.object({})

export const getSuggestedPetsResponseSchema = () =>
  z.object({
    pets: z.array(petProfileSchema()),
  })
