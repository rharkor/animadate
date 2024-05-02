import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { CHARACTERISTIC, PET_KIND } from "@prisma/client"

import { upsertPetResponseSchema, upsertPetSchema } from "./schemas"

export const upsertPet = async ({ input, ctx: { session } }: apiInputFromSchema<typeof upsertPetSchema>) => {
  ensureLoggedIn(session)
  try {
    const { id, name, description, birthdate, breed, characteristics, kind, photos } = input

    const uploadingPhotos = await prisma.fileUploading.findMany({
      where: {
        key: {
          in: photos.map((p) => p.key),
        },
      },
    })

    const pet = await prisma.pet.upsert({
      where: {
        id,
      },
      update: {
        name,
        description,
        birthdate,
        breed,
        characteristics: {
          set: (characteristics as CHARACTERISTIC[]).map((c) => ({
            id: id as string,
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
                fileUploading: {
                  connect: {
                    id: uploadingFile.id,
                  },
                },
              }
            }),
            skipDuplicates: true,
          },
        },
      },
      create: {
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
                fileUploading: {
                  connect: {
                    id: uploadingFile.id,
                  },
                },
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

    const res: z.infer<ReturnType<typeof upsertPetResponseSchema>> = {
      pet,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
