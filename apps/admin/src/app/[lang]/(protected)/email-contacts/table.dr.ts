import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { TableTopContentDr } from "./table-top-content.dr"

export const EmailContactsTableDr = dictionaryRequirements(
  {
    email: true,
    createdAt: true,
    timeUnit: true,
    noData: true,
    loading: true,
    actions: true,
    deleteEmailContact: true,
    cancel: true,
    delete: true,
    emailContacts: true,
    deleteEmailContactDescription: true,
  },
  TableTopContentDr
)
