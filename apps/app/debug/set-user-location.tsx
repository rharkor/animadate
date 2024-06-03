import inquirer from "inquirer"

import { prisma } from "@/lib/prisma"
import { createUserLocation, updateUserLocation } from "@animadate/app-db/utils"
import { logger } from "@animadate/lib"

import locations from "../database/mock/locations.json"

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

  const answers2 = await inquirer.prompt([
    {
      type: "list",
      name: "location",
      message: "Select a location",
      choices: locations.map((location) => location.name),
    },
  ])

  const resolvedLocation = locations.find((location) => location.name === answers2.location)
  if (!resolvedLocation) {
    logger.error("Location not found")
    return
  }

  if (user.lastLocation) {
    logger.info(`User ${user.id} already has a location, updating it...`)
    await updateUserLocation(prisma, {
      userId: user.id,
      location: {
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
      },
    })
  } else {
    logger.info(`User ${user.id} does not have a location, creating it...`)
    await createUserLocation(prisma, {
      userId: user.id,
      location: {
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
      },
    })
  }
}

main()
