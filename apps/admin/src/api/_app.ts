import { router } from "../lib/server/trpc"

import { authRouter } from "./auth/_router"
import { emailContactsRouter } from "./email-contacts/_router"
import { eventsRouter } from "./events/_router"
import { keysRouter } from "./keys/_router"
import { mapRouter } from "./map/_router"
import { meRouter } from "./me/_router"
import { uploadRouter } from "./upload/_router"

export const appRouter = router({
  auth: authRouter,
  me: meRouter,
  upload: uploadRouter,
  events: eventsRouter,
  keys: keysRouter,
  emailContacts: emailContactsRouter,
  map: mapRouter,
})

export type AppRouter = typeof appRouter
