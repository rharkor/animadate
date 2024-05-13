import { CopiableDr } from "@/components/ui/copiable.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const AddKeyDr = dictionaryRequirements(
  {
    addKey: true,
    add: true,
    nameLiteral: true,
    cancel: true,
    apiKey: true,
    apiKeyCreated: true,
    apiKeyCreatedDesc: true,
    id: true,
    secret: true,
  },
  CopiableDr
)
