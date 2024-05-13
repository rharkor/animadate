import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const EventsTableDr = dictionaryRequirements({
  nameLiteral: true,
  createdAt: true,
  eventsList: true,
  noData: true,
  loading: true,
  kind: true,
  level: true,
  actions: true,
  close: true,
})
