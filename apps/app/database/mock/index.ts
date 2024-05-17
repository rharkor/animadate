import { prisma } from "database/utils"

import { rolesAsObject } from "@/constants"
import { hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { cmd } from "@animadate/lib"
import { CHARACTERISTIC } from "@prisma/client"

import dogs from "./dogs.json"
import users from "./users.json"

export const mock = async () => {
  //* Users
  const usersTask = cmd.startTask({
    name: `Creating ${users.length} users`,
  })
  let addedUsers = 0
  for (const user of users) {
    const userExists = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    })
    if (!userExists) {
      await prisma.user.create({
        data: {
          email: user.email,
          password: await hash(user.password, 12),
          role: rolesAsObject.user,
          emailVerified: new Date(),
          hasPassword: true,
          name: user.name,
        },
      })
      usersTask.print(`Added user ${user.email}`)
      addedUsers++
    } else {
      usersTask.print(`User ${user.email} already exists`)
    }
  }
  usersTask.stop(`Added ${addedUsers} users`)

  //* Dogs
  const dogsImagesTask = cmd.startTask({
    name: `Creating ${dogs.length} dogs`,
  })
  let addedDogs = 0
  const owners = await prisma.user.findMany({
    where: {
      email: {
        in: users.map((user) => user.email),
      },
    },
  })
  for (const dog of dogs) {
    const owner = owners.find((owner) => owner.email === dog.owner_email)
    if (!owner) {
      dogsImagesTask.print(`Owner ${dog.owner_email} not found`)
      continue
    }
    const dogExists = await prisma.pet.findUnique({
      where: {
        ownerId_name: {
          ownerId: owner.id,
          name: dog.name,
        },
      },
    })
    if (!dogExists) {
      // Photos
      const getDogImageKey = (dogImage: string) => {
        return `dogs/pet-profile/mock/${dog.name}/${dogImage}.jpg`
      }
      for (const dogImage of dog.photos) {
        const dogImageExists = await prisma.file.findUnique({
          where: {
            key: getDogImageKey(dogImage),
          },
        })
        if (!dogImageExists) {
          await prisma.file.create({
            data: {
              bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
              endpoint: "animadate-public",
              key: getDogImageKey(dogImage),
              filetype: "image/jpeg",
            },
          })
          dogsImagesTask.print(`Added dog image ${dogImage}`)
        } else {
          dogsImagesTask.print(`Dog image ${dogImage} already exists`)
        }
      }

      // Profile
      await prisma.pet.create({
        data: {
          name: dog.name,
          description: dog.description,
          birthdate: new Date(dog.birthdate),
          breed: dog.breed,
          characteristics: {
            create: (dog.characteristics as CHARACTERISTIC[]).map((c) => ({
              value: c,
            })),
          },
          kind: "DOG",
          photos: {
            connect: dog.photos.map((p) => ({
              key: getDogImageKey(p),
            })),
          },
          owner: {
            connect: {
              id: owner.id,
            },
          },
        },
      })
      dogsImagesTask.print(`Added dog ${dog.name}`)
      addedDogs++
    } else {
      dogsImagesTask.print(`Dog ${dog.name} already exists`)
    }
  }
  dogsImagesTask.stop(`Added ${addedDogs} dogs`)
}
