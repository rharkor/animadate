import { useCameraDr } from "@/hooks/use-camera/use-camera.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { ImageCropDr } from "./image-crop.dr"

export const FileDr = dictionaryRequirements(ImageCropDr)

export const FileUploadDr = dictionaryRequirements(
  {
    uploadDescription: true,
    takePhoto: true,
    or: true,
    selectPhoto: true,
    invalidFileType: true,
  },
  FileDr,
  useCameraDr
)
