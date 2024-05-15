import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { TableTopContentDr } from "./table-top-content.dr"

export const EventsTableDr = dictionaryRequirements(
  {
    nameLiteral: true,
    createdAt: true,
    eventsList: true,
    noData: true,
    loading: true,
    kind: true,
    level: true,
    actions: true,
    close: true,
    timeUnit: true,
    appLiteral: true,
  },
  TableTopContentDr
)
