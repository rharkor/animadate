import { z } from "zod"

import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { CHARACTERISTIC, PET_KIND } from "@prisma/client"

import { TDictionary } from "../../lib/langs"

export const upsertPetSchemaDr = dictionaryRequirements({
  errors: {
    petMinName: true,
    petMaxName: true,
    petMinBreed: true,
    petMaxBreed: true,
    petCharacteristicInvalid: true,
    petCharacteristicMin: true,
    petCharacteristicMax: true,
    petPhotoMin: true,
    petPhotoMax: true,
    petKindInvalid: true,
    petDescriptionMin: true,
    petDescriptionMax: true,
  },
})
export const minPetCharacteristics = 2
export const maxPetCharacteristics = 7
export const minPetPhotos = 2
export const maxPetPhotos = 5
export const upsertPetSchema = (dictionary?: TDictionary<typeof upsertPetSchemaDr>) =>
  z.object({
    id: z.string().optional(),
    name: z
      .string()
      .min(2, dictionary?.errors.petMinName.replace("{size}", "2"))
      .max(50, dictionary?.errors.petMaxName.replace("{size}", "50")),
    description: z.string().min(2).max(500),
    kind: z
      .literal("dog")
      .refine((value) => Object.values(PET_KIND).includes(value), dictionary?.errors.petKindInvalid),
    breed: z
      .string()
      .min(2, dictionary?.errors.petMinBreed.replace("{size}", "2"))
      .max(50, dictionary?.errors.petMaxBreed.replace("{size}", "50")),
    birthdate: z.coerce.date(),
    characteristics: z
      .array(
        z
          .string()
          .refine((value) => Object.values(CHARACTERISTIC).includes(value), dictionary?.errors.petCharacteristicInvalid)
      )
      .min(
        minPetCharacteristics,
        dictionary?.errors.petCharacteristicMin.replace("{size}", minPetCharacteristics.toString())
      )
      .max(
        maxPetCharacteristics,
        dictionary?.errors.petCharacteristicMax.replace("{size}", maxPetCharacteristics.toString())
      ),
    photos: z
      .array(
        z.object({
          key: z.string(),
          url: z.string(),
        })
      )
      .min(minPetPhotos, dictionary?.errors.petPhotoMin.replace("{size}", minPetPhotos.toString()))
      .max(maxPetPhotos, dictionary?.errors.petPhotoMax.replace("{size}", maxPetPhotos.toString())),
  })

export const upsertPetResponseSchema = () =>
  z.object({
    pet: z.object({
      id: z.string(),
    }),
  })
