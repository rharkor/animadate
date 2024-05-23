import { z } from "zod"

import { fileSchemaMinimal } from "@/schemas/file"

export const getProfilesLocationSchema = () =>
  z.object({
    radius: z.number(),
    latitude: z.number(),
    longitude: z.number(),
  })

export const getProfilesLocationResponseSchema = () =>
  z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      pet: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        kind: z.string(),
        breed: z.string(),
        birthdate: z.date(),
        characteristics: z.array(
          z.object({
            id: z.string(),
            value: z.string(),
          })
        ),
        photos: z.array(fileSchemaMinimal()),
      }),
    })
  )
