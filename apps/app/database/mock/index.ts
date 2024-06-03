import { rolesAsObject } from "@/constants"
import { hash as bhash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { CHARACTERISTIC } from "@animadate/app-db/generated/client"
import { createUserLocation } from "@animadate/app-db/utils"
import { cmd, logger } from "@animadate/lib"

import { seedPrisma } from "../utils"

import dogs from "./dogs.json"
import locations from "./locations.json"
import users from "./users.json"

const hashed = new Map<string, string>()
const hash = async (data: string) => {
  if (hashed.has(data)) {
    return hashed.get(data)
  }
  const result = await bhash(data, 12)
  hashed.set(data, result)
  return result
}

export const mock = async () => {
  //* Users
  const usersTask = cmd.startTask({
    name: `Creating ${users.length} users`,
  })
  let addedUsers = 0
  for (const user of users) {
    const userExists = await seedPrisma.user.findUnique({
      where: {
        email: user.email,
      },
    })
    if (!userExists) {
      await seedPrisma.user.create({
        data: {
          email: user.email,
          password: await hash(user.password),
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
  const owners = await seedPrisma.user.findMany({
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
    const dogExists = await seedPrisma.pet.findUnique({
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
        return `dogs/pet-profile/mock/${dog.name.toLocaleLowerCase()}/${dogImage}.jpg`
      }
      for (const dogImage of dog.photos) {
        const dogImageExists = await seedPrisma.file.findUnique({
          where: {
            key: getDogImageKey(dogImage),
          },
        })
        if (!dogImageExists) {
          await seedPrisma.file.create({
            data: {
              bucket: "animadate-public",
              endpoint: env.NEXT_PUBLIC_S3_ENDPOINT,
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
      await seedPrisma.pet
        .create({
          data: {
            name: dog.name,
            description: dog.description,
            birthdate: new Date(dog.birthdate),
            breed: dog.breed,
            characteristics: {
              create: dog.characteristics.map((c) => ({
                value: c as CHARACTERISTIC,
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
        .catch((e) => {
          logger.error("Failed to create dog", dog.name)
          throw e
        })
      dogsImagesTask.print(`Added dog ${dog.name}`)
      addedDogs++
    } else {
      dogsImagesTask.print(`Dog ${dog.name} already exists`)
    }
  }
  dogsImagesTask.stop(`Added ${addedDogs} dogs`)

  //* User locations
  const userLocationsTask = cmd.startTask({
    name: `Creating user locations`,
  })
  let i = 0
  for (const jsonUser of users) {
    const user = await seedPrisma.user.findFirst({
      where: { email: jsonUser.email },
      include: {
        lastLocation: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    } else {
      if (user.lastLocation) {
        userLocationsTask.print(`${user.email} already has location`)
      } else {
        userLocationsTask.print(`Creating user ${user.email} location`)
        const resolvedLocation = locations.at(i)
        if (!resolvedLocation) {
          throw new Error("Location not found")
        } else {
          await createUserLocation(seedPrisma, {
            userId: user.id,
            location: {
              latitude: resolvedLocation.latitude,
              longitude: resolvedLocation.longitude,
            },
          })
        }
      }
    }
    i++
  }
  userLocationsTask.stop(`Added user locations`)
}
