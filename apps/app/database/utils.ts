import { config } from "dotenv"
config()

import { Spinner } from "cli-spinner"

import { PrismaClient } from "@animadate/app-db/generated/client"

export const spinner: Spinner | null = null

export const prisma = new PrismaClient()
