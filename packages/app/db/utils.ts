import { z } from "zod"

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

export const maxDefaultRadius = 3000 // TODO 5000
export const maxAdminRadius = 10000

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
  const schema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius: z.number(),
  })
  const input = schema.parse({
    latitude,
    longitude,
    radius,
  })
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
      latitude: input.latitude,
      longitude: input.longitude,
    })}
		) as distance
  ) as dist
where
	ST_DWithin(location::geography,
	${getStMakePoint({ latitude: input.latitude, longitude: input.longitude })}::geography,
	${Math.floor(input.radius)})
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

const idRegex = new RegExp(/^[0-9a-z]+$/) // Match a string of lowercase letters and numbers
export const getSuggestedPets = async (
  prisma: PrismaClient,
  _input: {
    userId: string
    alreadyLoaded: string[]
    limit: number
    enableInfiniteRadius: boolean
  }
) => {
  const schema = z.object({
    userId: z.string().regex(idRegex),
    alreadyLoaded: z.array(z.string().regex(idRegex)),
    limit: z.number(),
    enableInfiniteRadius: z.boolean(),
  })
  const input = schema.parse(_input)
  const suggested = await prisma.$queryRawUnsafe<
    {
      id: number
      userId: string
      st_x: number
      st_y: number
      distance: number
      petId: string
      petName: string
    }[]
  >(`
  select
	"userLocation".id,
	ST_X("userLocation"."location"::geometry) as "st_x",
	ST_Y("userLocation"."location"::geometry) as "st_y",
	distance,
	"userLocation"."userId",
	"pet"."id" as "petId",
	"pet"."name" as "petName"
from
	"UserLocation" as "userLocation"
left join "UserLocation" as "sourceUserLocation" on
	"sourceUserLocation"."userId" = '${input.userId}'
left join "User" as "user" on
	"user"."id" = "userLocation"."userId"
left join "Pet" as "pet" on
	"pet"."ownerId" = "user"."id"
left join "Pet" as "sourcePet" on
	"sourcePet"."ownerId" = '${input.userId}',
	lateral (
	select
		ST_DistanceSphere("userLocation"."location"::geometry,
		"sourceUserLocation"."location"::geometry) as distance
  ) as dist
where
  -- Not current owner's pet
  "pet"."ownerId" != '${input.userId}'
  ${
    input.enableInfiniteRadius
      ? ""
      : `
  -- Max radus
  and distance < ${maxDefaultRadius}
  `
  }
	-- Not already loaded in frontend
	and ${input.alreadyLoaded.length > 0 ? `"pet"."id" not in (${input.alreadyLoaded.map((id) => `'${id}'`).join(",")})` : "true = true"}
	-- Have at least one characteristic in common
	and exists (
		select 1
		from "Characteristic" "sourceCharacteristic"
		where "sourceCharacteristic"."petId" = "sourcePet"."id"
		and exists (
			select 1
			from "Characteristic" "characteristic"
			where "characteristic"."petId" = "pet"."id"
			and "sourceCharacteristic"."value" = "characteristic"."value"
		)
	)
	-- Not already liked or dismissed within the last 30 days
	and not exists (
		select 1
		from "PetAction" "petAction"
		where "petAction"."sourcePetId" = "sourcePet"."id"
		and (
			-- Not already liked
			"petAction"."action" = 'LIKE'
			or (
				-- Not already dismissed within the last 30 days
				"petAction"."action" = 'DISMISS'
				and "petAction"."updatedAt" < NOW() - interval '30 days' 
			)
		)
	)
order by distance asc
limit ${input.limit};
  `)

  return suggested
}
