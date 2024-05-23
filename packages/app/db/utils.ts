import { PrismaClient } from "./generated/client"

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

export const getPoint = ({ latitude, longitude }: { latitude: number; longitude: number }) =>
  `POINT(${longitude} ${latitude})`

export const getStMakePoint = ({ latitude, longitude }: { latitude: number; longitude: number }) =>
  `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}),4326)`

export const createUserLocation = async (prisma: PrismaClient, data: CreateUserLocation) => {
  // Insert the object into the database
  const point = getPoint({
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  })
  await prisma.$queryRaw`
      INSERT INTO "UserLocation" ("userId", location, "updatedAt") VALUES (${data.userId}, ST_GeomFromText(${point}, 4326), ${new Date()});
    `

  // Return the object
  return data
}

export const updateUserLocation = async (prisma: PrismaClient, data: UpdateUserLocation) => {
  // Update the object in the database
  const point = getPoint({
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  })
  await prisma.$queryRaw`
      UPDATE "UserLocation" SET location = ST_GeomFromText(${point}, 4326), "updatedAt" = ${new Date()} WHERE "userId" = ${data.userId};
    `

  // Return the object
  return data
}

export const maxDefaultRadius = 1500

export const getUsersInRadius = async (
  prisma: PrismaClient,
  {
    latitude,
    longitude,
    radius,
    maxRadius,
  }: {
    latitude: number
    longitude: number
    radius: number
    maxRadius?: number
  }
) => {
  maxRadius = maxRadius || maxDefaultRadius
  radius = Math.min(radius, maxRadius)
  const result = await prisma.$queryRawUnsafe<
    {
      id: number
      userId: string
      st_x: number
      st_y: number
      distance: number
    }[]
  >(`select
	"UserLocation".id,
	ST_X(location::geometry),
	ST_Y(location::geometry),
	distance,
	"userId"
from
	"UserLocation"
left join "User" as "user" on
	"user"."id" = "UserLocation"."userId"
left join "Pet" as "pet" on
  "pet"."ownerId" = "user"."id",
	lateral (
	select
		ST_DistanceSphere(location::geometry,
    ${getStMakePoint({
      latitude,
      longitude,
    })}
		) as distance
  ) as dist
where
	ST_DWithin(location::geography,
	${getStMakePoint({ latitude, longitude })}::geography,
	${Math.floor(radius)})
  and "pet"."id" is not null
order by
	distance asc`)

  // Transform to our custom type
  const usersLocation = result.map((data) => {
    return {
      id: data.id,
      userId: data.userId,
      location: {
        longitude: data.st_x || 0,
        latitude: data.st_y || 0,
      },
      distance: Math.round(data.distance || 0),
    }
  })

  // Return data
  return usersLocation
}

export const getLatituteLongitude = async (prisma: PrismaClient, userId: string) => {
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
      longitude: data.st_x || 0,
      latitude: data.st_y || 0,
    }
  })

  // Return data
  return usersLocation
}

export const getUsersProfileWithPet = async (usersId: string[], prisma: PrismaClient) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: usersId,
      },
      pet: {
        isNot: null,
      },
    },
    include: {
      pet: {
        include: {
          photos: true,
          characteristics: true,
        },
      },
      profilePicture: true,
    },
  })

  type UserWithPet = ((typeof users)[number] & {
    pet: NonNullable<(typeof users)[number]["pet"]>
  })[]

  return users as UserWithPet
}
