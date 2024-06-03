"use client"

import { TDictionary } from "@/lib/langs"
import { Checkbox } from "@nextui-org/react"

import { MapSettingsDr } from "./settings.dr"

export default function MapSettings({
  displayRadiusCircle,
  setDisplayRadiusCircle,
  dictionary,
}: {
  displayRadiusCircle: boolean
  setDisplayRadiusCircle: (value: boolean) => void
  dictionary: TDictionary<typeof MapSettingsDr>
}) {
  return (
    <section className="absolute bottom-2 left-2 rounded-medium bg-default-50 p-2">
      <Checkbox isSelected={displayRadiusCircle} onValueChange={setDisplayRadiusCircle}>
        {dictionary.displayRadiusCircle}
      </Checkbox>
    </section>
  )
}
