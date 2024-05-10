import { upsertPetSchemaDr } from "@/api/pet/schemas"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { ChipsContainerDr } from "./chips-container.dr"
import { DesktopFormDr } from "./desktop-form.dr"
import { PetProfilePhotosDr } from "./photos.dr"

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
