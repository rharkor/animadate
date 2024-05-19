import { PrismaClient } from "@animadate/app-db/generated/client"

export type Location = {
  latitude: number
  longitude: number
}

export type CreateUserLocation = {
  userId: string
  location: Location
}

export type UpdateUserLocation = {
  userId: string
  location: Location
}

export const createUserLocation = async (prisma: PrismaClient, data: CreateUserLocation) => {
  // Insert the object into the database
  const point = `POINT(${data.location.longitude} ${data.location.latitude})`
  await prisma.$queryRaw`
      INSERT INTO "UserLocation" ("userId", location, "updatedAt") VALUES (${data.userId}, ST_GeomFromText(${point}, 4326), ${new Date()});
    `

  // Return the object
  return data
}

export const updateUserLocation = async (prisma: PrismaClient, data: UpdateUserLocation) => {
  // Update the object in the database
  const point = `POINT(${data.location.longitude} ${data.location.latitude})`
  await prisma.$queryRaw`
      UPDATE "UserLocation" SET location = ST_GeomFromText(${point}, 4326), "updatedAt" = ${new Date()} WHERE "userId" = ${data.userId};
    `

  // Return the object
  return data
}
