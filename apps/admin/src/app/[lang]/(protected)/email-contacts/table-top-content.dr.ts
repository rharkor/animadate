import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { AddEmailContactDr } from "./add-email.dr"

export const TableTopContentDr = dictionaryRequirements(
  {
    searchByEmail: true,
  },
  AddEmailContactDr
)
