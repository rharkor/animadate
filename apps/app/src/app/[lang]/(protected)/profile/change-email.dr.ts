import { changeEmailSchemaDr, validateChangeEmailSchemaDr } from "@/api/me/schemas"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const ChangeEmailDr = dictionaryRequirements(
  {
    changeEmail: true,
    next: true,
    previous: true,
    change: true,
    newEmail: true,
    password: true,
    changeEmailTokenSentByMail: true,
    token: true,
    changedEmailSuccessfully: true,
    currentEmail: true,
    unknownError: true,
  },
  changeEmailSchemaDr,
  validateChangeEmailSchemaDr
)
