import { FileUploadDr } from "@/components/ui/file-upload.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const UpdateAvatarDr = dictionaryRequirements(
  {
    updateAvatar: true,
    errors: {
      noFileSelected: true,
      fileTooLarge: true,
    },
    unknownError: true,
  },
  FileUploadDr
)
