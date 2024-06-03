import { ChipsContainerDr } from "@/components/pet/chips-container.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PetProfileDr } from "../profile/pet-profile/pet-profile.dr"

export const MatchProfileDr = dictionaryRequirements(
  {
    km: true,
  },
  PetProfileDr,
  ChipsContainerDr
)
