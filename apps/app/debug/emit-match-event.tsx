import inquirer from "inquirer"
import { exit } from "process"

import { onMatchResponseSchema } from "@/api/match/schemas"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { getSuggestedPets } from "@animadate/app-db/utils"
import { logger } from "@animadate/lib"

const main = async () => {
  const answers1 = await inquirer.prompt([
    {
      type: "input",
      name: "user",
      message: "Enter the user ID or email:",
      default: "antoine.dupont@example.com",
    },
  ])

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: answers1.user }, { email: answers1.user }],
    },
    include: {
      lastLocation: true,
      pet: true,
    },
  })

  if (!user) {
    logger.error("User not found")
    exit(1)
  }

  if (!user.pet) {
    logger.error("User does not have a pet")
    exit(1)
  }

  //? Get some suggested
  const suggested = await getSuggestedPets(prisma, {
    alreadyLoaded: [],
    limit: 10,
    userId: user.id,
    enableInfiniteRadius: true,
  })

  const pets = await prisma.pet.findMany({
    where: {
      id: {
        in: suggested.map((s) => s.petId),
      },
    },
    include: {
      photos: {
        orderBy: {
          order: "asc",
        },
      },
      characteristics: true,
    },
  })
  if (pets.length === 0) {
    logger.error("No pets found")
    exit(1)
  }

  const chosen = await inquirer.prompt([
    {
      type: "list",
      name: "pet",
      message: "Select a pet",
      choices: pets.map((pet) => pet.name),
    },
  ])
  const chosenPet = pets.find((pet) => pet.name === chosen.pet)

  if (!chosenPet) {
    logger.error("Pet not found")
    exit(1)
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: chosenPet.id,
    },
    include: {
      photos: {
        orderBy: {
          order: "asc",
        },
      },
      characteristics: true,
    },
  })

  await redis.connect().catch(() => {})
  const data = onMatchResponseSchema().parse({
    pet,
  })
  const channel = `on-match:${user.pet.id}`
  await redis.publish(channel, JSON.stringify(data))
  logger.info(`Published to ${channel}`)
  exit(0)
}

main()
