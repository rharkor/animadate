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
  const alreadyLoaded: string[] = []

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: {
        not: user.id,
      },
      id: {
        notIn: alreadyLoaded,
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
    take: limit,
  })

  logger.info(`Found ${pets.length} pets\n` + pets.map((p) => `${p.id}: ${p.name}`).join("\n"))
}

main()
