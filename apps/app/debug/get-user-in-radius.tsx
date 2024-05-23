import inquirer from "inquirer"

import { prisma } from "@/lib/prisma"
import { getLatituteLongitude, getUsersInRadius } from "@animadate/app-db/utils"
import { logger } from "@animadate/lib"

import knownLocations from "../database/mock/locations.json"

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
      type: "input",
      name: "radius",
      message: "Enter the radius in meters:",
      default: 1500,
    },
  ])

  if (!user.lastLocation) {
    logger.error("User does not have a location")
    return
  }

  const location = (await getLatituteLongitude(prisma, user.id))[0]
  const users = await getUsersInRadius(prisma, {
    latitude: location.latitude,
    longitude: location.longitude,
    radius: answers2.radius,
    maxRadius: answers2.radius,
  })
  logger.info(`Found ${users.length} users in ${answers2.radius} meters radius`)
  users.forEach((user) => {
    const knownLocation = knownLocations.find(
      (location) => location.latitude === user.location.latitude && location.longitude === user.location.longitude
    )
    if (knownLocation) {
      logger.log(`User ${user.userId} is at ${knownLocation.name} (${user.distance} meters)`)
    } else {
      logger.log(
        `User ${user.userId} is at ${user.location.latitude}, ${user.location.longitude} (${user.distance} meters)`
      )
    }
  })
}

main()
