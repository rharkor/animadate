import { updateUserSchemaDr } from "@/api/me/schemas"
import { CopiableDr } from "@/components/ui/copiable.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { UpdateAvatarDr } from "./update-avatar.dr"

export const UpdatePersonalInformationsDr = dictionaryRequirements(
  {
    auth: {
      name: true,
    },
    reset: true,
    saveChanges: true,
    needSavePopup: true,
  },
  UpdateAvatarDr,
  updateUserSchemaDr,
  CopiableDr
)
