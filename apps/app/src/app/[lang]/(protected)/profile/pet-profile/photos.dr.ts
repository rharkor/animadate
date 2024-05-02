import { FileUploadDr } from "@/components/ui/file-upload.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const PetProfilePhotosDr = dictionaryRequirements(
  {
    petProfilePhotosRequirements: true,
    uploadPhoto: true,
    errors: {
      fileTooLarge: true,
    },
    unknownError: true,
    upload: true,
  },
  FileUploadDr
)
