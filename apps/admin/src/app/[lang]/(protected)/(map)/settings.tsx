"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Checkbox } from "@nextui-org/react"

import { MapSettingsDr } from "./settings.dr"

export default function MapSettings({
  displayRadiusCircle,
  setDisplayRadiusCircle,
  displayMarkers,
  setDisplayMarkers,
  dictionary,
}: {
  displayRadiusCircle: boolean
  setDisplayRadiusCircle: (value: boolean) => void
  displayMarkers: boolean
  setDisplayMarkers: (value: boolean) => void
  dictionary: TDictionary<typeof MapSettingsDr>
}) {
  const [isDisplayed, setIsDisplayed] = useState(false)

  return (
    <section
      className={cn("absolute right-0 top-0 z-20 flex gap-2 pr-2 pt-2 transition-all", {
        "translate-x-full": !isDisplayed,
      })}
    >
      <div className="relative flex flex-col gap-2 rounded-medium bg-default-50 p-2">
        <Button
          className="absolute -left-2 top-0 h-max min-w-0 -translate-x-full p-2"
          color="primary"
          onPress={() => setIsDisplayed(!isDisplayed)}
        >
          <ChevronLeft
            className={cn("size-4 transition-all", {
              "rotate-180": isDisplayed,
            })}
          />
        </Button>
        <Checkbox isSelected={displayRadiusCircle} onValueChange={setDisplayRadiusCircle}>
          {dictionary.displayRadiusCircle}
        </Checkbox>
        <Checkbox isSelected={displayMarkers} onValueChange={setDisplayMarkers}>
          {dictionary.displayMarkers}
        </Checkbox>
      </div>
    </section>
  )
}
