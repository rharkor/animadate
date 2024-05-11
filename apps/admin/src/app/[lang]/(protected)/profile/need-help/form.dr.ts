import { needHelpSchemaDr } from "@/api/me/schemas"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const NeedHelpFormDr = dictionaryRequirements(
  {
    needHelpMessageLabel: true,
    submit: true,
    contactEmail: true,
    needHelpDescription: true,
    submitSuccess: true,
    auth: {
      name: true,
    },
  },
  needHelpSchemaDr
)
