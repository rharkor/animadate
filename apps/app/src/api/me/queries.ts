import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getAccountResponseSchema } from "./schemas"

export const getAccount = async ({ ctx: { session } }: apiInputFromSchema<undefined>) => {
  try {
    ensureLoggedIn(session)

    const account = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        profilePicture: true,
        pet: true,
      },
    })
    if (!account) return ApiError("userNotFound", "UNAUTHORIZED")
    const data: z.infer<ReturnType<typeof getAccountResponseSchema>> = {
      user: { ...account, hasPetProfile: !!account.pet },
    }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
