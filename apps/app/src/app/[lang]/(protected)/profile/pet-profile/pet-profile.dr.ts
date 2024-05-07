import { upsertPetSchemaDr } from "@/api/pet/schemas"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { BreedSelectDr } from "./breed-select.dr"
import { CharacteristicsSelectDr } from "./characteristics-select.dr"
import { PetProfilePhotosDr } from "./photos.dr"

export const PetProfileDr = dictionaryRequirements(
  {
    petName: true,
    age: true,
    yo: true,
    yos: true,
    description: true,
    confirm: true,
  },
  upsertPetSchemaDr,
  CharacteristicsSelectDr,
  PetProfilePhotosDr,
  BreedSelectDr
)
