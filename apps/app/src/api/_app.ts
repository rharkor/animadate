import { router } from "../lib/server/trpc"

import { authRouter } from "./auth/_router"
import { matchRouter } from "./match/_router"
import { meRouter } from "./me/_router"
import { petRouter } from "./pet/_router"
import { uploadRouter } from "./upload/_router"

export const appRouter = router({
  auth: authRouter,
  me: meRouter,
  upload: uploadRouter,
  pet: petRouter,
  match: matchRouter,
})

export type AppRouter = typeof appRouter
