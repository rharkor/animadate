import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { GenerateTotpDr } from "./totp/generate.dr"
import { UpdateAvatarDr } from "./avatar.dr"

export const UpdateAccountDr = dictionaryRequirements(
  {
    auth: {
      name: true,
    },
    errors: {
      emailNotVerified: true,
      name: true,
    },
    needSavePopup: true,
    reset: true,
    saveChanges: true,
  },
  UpdateAvatarDr,
  GenerateTotpDr
)
