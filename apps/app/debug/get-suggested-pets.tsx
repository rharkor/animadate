import inquirer from "inquirer"

import { prisma } from "@/lib/prisma"
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
    },
  })

  if (!user) {
    logger.error("User not found")
    return
  }

  const limit = 10
  const cursor = null
  const cursorKey = "id"

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: {
        not: user.id,
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
    take: limit + 1, // get an extra item at the end which we'll use as next cursor
    cursor: cursor ? { [cursorKey]: cursor } : undefined,
    orderBy: {
      [cursorKey]: "asc",
    },
  })

  logger.info(pets.map((p) => p.name))
}

main()
