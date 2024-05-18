import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { BreedSelectDr } from "./breed-select.dr"
import { CharacteristicsSelectDr } from "./characteristics-select.dr"

export const ChipsContainerDr = dictionaryRequirements({}, CharacteristicsSelectDr, BreedSelectDr)
