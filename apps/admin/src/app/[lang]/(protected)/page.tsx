import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import Map from "./(map)/map"
import { MapDr } from "./(map)/map.dr"

import "maplibre-gl/dist/maplibre-gl.css"

export default async function MapPage({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        map: true,
      },
      MapDr
    )
  )

  return (
    <>
      <h1 className={cn("text-2xl font-medium")}>{dictionary.map}</h1>
      <section className="relative my-6 flex-1 overflow-hidden rounded-medium">
        <Map dictionary={dictionary} />
      </section>
    </>
  )
}
