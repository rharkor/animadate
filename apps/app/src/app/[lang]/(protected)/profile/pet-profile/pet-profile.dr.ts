import { upsertPetSchemaDr } from "@/api/pet/schemas"
import { ChipsContainerDr } from "@/components/pet/chips-container.dr"
import { PetProfilePhotosDr } from "@/components/pet/photos.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { DesktopFormDr } from "./desktop-form.dr"

export const PetProfileDr = dictionaryRequirements(
  {
    petName: true,
    age: true,
    yo: true,
    yos: true,
    description: true,
    confirm: true,
    preview: true,
  },
  upsertPetSchemaDr,
  PetProfilePhotosDr,
  ChipsContainerDr,
  DesktopFormDr
)
