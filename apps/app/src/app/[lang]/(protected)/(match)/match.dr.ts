import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { MatchProfileDr } from "./match-profile.dr"

export const MatchDr = dictionaryRequirements(
  {
    noMoreProfiles: true,
    searchFurther: true,
  },
  MatchProfileDr
)
