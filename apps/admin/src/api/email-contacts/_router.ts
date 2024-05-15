import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { createEmailContact, deleteEmailContact } from "./mutations"
import { getEmailContacts } from "./queries"
import {
  createEmailContactchema,
  createEmailContactResponseSchema,
  deleteEmailContactchema,
  deleteEmailContactResponseSchema,
  getEmailContactsResponseSchema,
  getEmailContactsSchema,
} from "./schemas"

export const emailContactsRouter = router({
  createEmailContact: authenticatedProcedure
    .input(createEmailContactchema())
    .output(createEmailContactResponseSchema())
    .mutation(createEmailContact),
  deleteEmailContact: authenticatedProcedure
    .input(deleteEmailContactchema())
    .output(deleteEmailContactResponseSchema())
    .mutation(deleteEmailContact),
  getEmailContacts: authenticatedProcedure
    .input(getEmailContactsSchema())
    .output(getEmailContactsResponseSchema())
    .query(getEmailContacts),
})
