import { CopiableDr } from "@/components/ui/copiable.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const MinimizedProfileDr = dictionaryRequirements(
  {
    updateAvatar: true,
    errors: {
      noFileSelected: true,
      fileTooLarge: true,
    },
    unknownError: true,
  },
  CopiableDr
)
