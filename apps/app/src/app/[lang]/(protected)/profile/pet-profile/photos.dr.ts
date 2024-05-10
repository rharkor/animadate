import { FileUploadDr } from "@/components/ui/file-upload.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PhotosDisplayDr } from "./photos-display.dr"

export const PetProfilePhotosDr = dictionaryRequirements(
  {
    uploadPhoto: true,
    errors: {
      fileTooLarge: true,
    },
    unknownError: true,
    upload: true,
  },
  FileUploadDr,
  PhotosDisplayDr
)
