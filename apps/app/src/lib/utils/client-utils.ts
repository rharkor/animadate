import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { z } from "zod"

import { fileSchemaMinimal } from "@/schemas/file"
import { logger } from "@animadate/lib"
import { TRPCClientErrorLike } from "@trpc/client"

import { AppRouter } from "../../api/_app"
import { TDictionary } from "../langs"

import { handleApiError } from "."

type TOptions = {
  showNotification?: boolean // default true
}

type AppRouterInstance = ReturnType<typeof useRouter>

export const handleQueryError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary<{
    unknownError: true
  }>,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T & { code: string | undefined; message: string } => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Query error:", resp)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary<{
    unknownError: true
  }>,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T & { code: string | undefined; message: string } => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}

export const getImageUrl = (
  imageFile: Omit<z.infer<ReturnType<typeof fileSchemaMinimal>>, "id" | "createdAt" | "updatedAt"> | undefined | null
) => {
  if (!imageFile) {
    return imageFile
  }

  const { bucket, endpoint, key } = imageFile
  if (key.startsWith("https://") || key.startsWith("http://")) return key
  return "https://" + bucket + "." + endpoint + "/" + key
}

export const getFallbackAvatar = (name: string, scale: number = 75) => {
  return `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${name}&scale=${scale}`
}
