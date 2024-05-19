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
  const point = `POINT(${data.location.latitude} ${data.location.longitude})`
  await prisma.$queryRaw`
      INSERT INTO "UserLocation" ("userId", location, "updatedAt") VALUES (${data.userId}, ST_GeomFromText(${point}, 4326), ${new Date()});
    `

  // Return the object
  return data
}

export const updateUserLocation = async (prisma: PrismaClient, data: UpdateUserLocation) => {
  // Update the object in the database
  const point = `POINT(${data.location.latitude} ${data.location.longitude})`
  await prisma.$queryRaw`
      UPDATE "UserLocation" SET location = ST_GeomFromText(${point}, 4326), "updatedAt" = ${new Date()} WHERE "userId" = ${data.userId};
    `

  // Return the object
  return data
}

export const getUserInRadius = async (
  prisma: PrismaClient,
  { latitude, longitude, radius }: { latitude: number; longitude: number; radius: number }
) => {
  // Query for clostest points of interests
  const result = await prisma.$queryRaw<
    {
      id: number | null
      userId: string | null
      st_x: number | null
      st_y: number | null
      distance: number | null
    }[]
  >`SELECT id, "userId", ST_X(location::geometry), ST_Y(location::geometry), distance
      FROM "UserLocation",
      LATERAL (
        SELECT ST_DistanceSphere(location::geometry, ST_MakePoint(${latitude}, ${longitude})) as distance
      ) as dist 
      WHERE ST_DWithin(location::geography, ST_MakePoint(${latitude}, ${longitude})::geography, ${radius})
      ORDER BY distance ASC`

  // Transform to our custom type
  const usersLocation = result.map((data) => {
    return {
      id: data.id,
      userId: data.userId,
      location: {
        latitude: data.st_x || 0,
        longitude: data.st_y || 0,
      },
      distance: Math.round(data.distance || 0),
    }
  })

  // Return data
  return usersLocation
}

export const getLatituteLongitude = async (prisma: PrismaClient, userId: string) => {
  // Query for clostest points of interests
  const result = await prisma.$queryRaw<
    {
      st_x: number | null
      st_y: number | null
    }[]
  >`SELECT ST_X(location::geometry), ST_Y(location::geometry) 
      FROM "UserLocation" 
      WHERE "userId" = ${userId}`

  // Transform to our custom type
  const usersLocation = result.map((data) => {
    return {
      latitude: data.st_x || 0,
      longitude: data.st_y || 0,
    }
  })

  // Return data
  return usersLocation
}
