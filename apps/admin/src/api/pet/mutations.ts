import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ApiError, ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { CHARACTERISTIC, PET_KIND } from "@animadate/app-db/generated/client"

import { upsertPetResponseSchema, upsertPetSchema } from "./schemas"

export const upsertPet = async ({ input, ctx: { session } }: apiInputFromSchema<typeof upsertPetSchema>) => {
  ensureLoggedIn(session)
  try {
    const { id, name, description, birthdate, breed, characteristics, kind, photos } = input

    const res = await prisma.$transaction(async (prisma) => {
      const uploadingPhotos = await prisma.fileUploading.findMany({
        where: {
          key: {
            in: photos.map((p) => p.key),
          },
        },
      })

      const currentPet = id
        ? await prisma.pet.findUnique({
            where: {
              id,
            },
          })
        : null

      if (id && !currentPet) {
        await ApiError("petNotFound")
      }

      if (currentPet && currentPet.ownerId !== session.user.id) {
        await ApiError("notPetOwner")
      }

      const pet = currentPet
        ? await prisma.pet.update({
            where: {
              id,
            },
            data: {
              name,
              description,
              birthdate,
              breed,
              characteristics: {
                set: (characteristics as CHARACTERISTIC[]).map((c) => ({
                  value_petId: {
                    value: c,
                    petId: id as string,
                  },
                })),
              },
              kind: kind as PET_KIND,
            },
          })
        : await prisma.pet.create({
            data: {
              name,
              description,
              birthdate,
              breed,
              characteristics: {
                create: (characteristics as CHARACTERISTIC[]).map((c) => ({
                  value: c,
                })),
              },
              kind: kind as PET_KIND,
              photos: {
                createMany: {
                  data: photos.map((p) => {
                    const uploadingFile = uploadingPhotos.find((up) => up.key === p.key)
                    if (!uploadingFile) throw new Error("File not found")
                    return {
                      bucket: uploadingFile.bucket,
                      endpoint: uploadingFile.endpoint,
                      key: uploadingFile.key,
                      filetype: uploadingFile.filetype,
                      fileUploadingId: uploadingFile.id,
                      order: p.order,
                    }
                  }),
                },
              },
              owner: {
                connect: {
                  id: session.user.id,
                },
              },
            },
          })

      // If updating also update the photos
      if (currentPet) {
        await Promise.all(
          photos.map(async (p) => {
            const file = await prisma.file.findUnique({
              where: {
                key: p.key,
              },
            })
            if (!file) {
              const uploadingFile = uploadingPhotos.find((up) => up.key === p.key)
              if (!uploadingFile) throw new Error("File not found") // Should never happen
              const data = {
                bucket: uploadingFile.bucket,
                endpoint: uploadingFile.endpoint,
                key: uploadingFile.key,
                filetype: uploadingFile.filetype,
                fileUploadingId: uploadingFile.id,
                order: p.order,
                petPhotosId: pet.id,
              }
              return prisma.file.create({
                data,
              })
            } else {
              return prisma.file.update({
                where: {
                  key: p.key,
                },
                data: {
                  order: p.order,
                },
              })
            }
          })
        )
      }

      const res: z.infer<ReturnType<typeof upsertPetResponseSchema>> = {
        pet,
      }
      return res
    })
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
