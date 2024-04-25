import { changePasswordSchemaDr } from "@/api/me/schemas"
import { WithPasswordStrengthPopoverDr } from "@/components/ui/form.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const ChangePasswordDr = dictionaryRequirements(
  {
    changePassword: true,
    change: true,
    newPassword: true,
    currentPassword: true,
    success: true,
    errors: {
      password: {
        dontMatch: true,
      },
    },
    unknownError: true,
    changedPasswordSuccessfully: true,
    confirmPassword: true,
    cancel: true,
  },
  changePasswordSchemaDr,
  WithPasswordStrengthPopoverDr
)
