import { lastLocaleExpirationInSeconds } from "@/constants"

import { Locale } from "../i18n-config"
import { prisma } from "../prisma"
import { redis } from "../redis"

// Get last locale from redis or db
export const getLastLocale = async (userId: string) => {
  const lastLocale = await redis.get(`lastLocale:${userId}`)
  if (lastLocale) {
    return lastLocale
  }
  const lastLocaleFromDb = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLocale: true },
  })
  if (lastLocaleFromDb && lastLocaleFromDb.lastLocale) {
    await redis.setex(`lastLocale:${userId}`, lastLocaleExpirationInSeconds, lastLocaleFromDb.lastLocale)
    return lastLocaleFromDb.lastLocale
  }
  return null
}
// Set last locale in redis and db
export const setLastLocale = async (userId: string, locale: Locale) => {
  await redis.setex(`lastLocale:${userId}`, lastLocaleExpirationInSeconds, locale)
  await prisma.user.update({
    where: { id: userId },
    data: { lastLocale: locale },
  })
}
