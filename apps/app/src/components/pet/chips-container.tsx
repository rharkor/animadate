"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { TDictionary } from "@/lib/langs"

import BreedSelect from "./breed-select"
import CharacteristicsSelect from "./characteristics-select"
import { ChipsContainerDr } from "./chips-container.dr"

export default function ChipsContainer({
  dictionary,
  breedError,
  characteristicsError,
  handleBreedChange,
  handleCharacteristicsChange,
  breed,
  characteristics,
  chipsContainer,
  isReadOnly,
}: {
  dictionary: TDictionary<typeof ChipsContainerDr>
  breedError?: string | null
  characteristicsError?: string | null
  handleCharacteristicsChange?: (value: string[]) => void
  handleBreedChange?: (value: string) => string
  breed: string
  characteristics: string[]
  chipsContainer: React.RefObject<HTMLDivElement>
  isReadOnly?: boolean
}) {
  const [isChipsDragged, setIsChipsDragged] = useState<boolean>(false)
  const [hasChipsBeenDraggedRecently, setHasChipsBeenDraggedRecently] = useState<boolean>(false)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isChipsDragged) {
      setHasChipsBeenDraggedRecently(true)
    } else {
      timeout = setTimeout(() => {
        setHasChipsBeenDraggedRecently(false)
      }, 100)
    }
    return () => clearTimeout(timeout)
  }, [isChipsDragged])

  return (
    <div ref={chipsContainer} className="w-max max-w-full">
      <motion.div
        drag="x"
        dragConstraints={chipsContainer}
        dragElastic={0.1}
        dragMomentum={false}
        dragTransition={{ bounceDamping: 60, bounceStiffness: 600 }}
        className="flex w-max flex-row items-end"
        onDragStart={() => setIsChipsDragged(true)}
        onDragEnd={() => setIsChipsDragged(false)}
      >
        <CharacteristicsSelect
          dictionary={dictionary}
          characteristics={characteristics}
          setCharacteristics={handleCharacteristicsChange}
          error={characteristicsError}
          clickDisabled={hasChipsBeenDraggedRecently}
          isReadOnly={isReadOnly}
        />
        <BreedSelect
          dictionary={dictionary}
          breed={breed}
          setBreed={handleBreedChange}
          error={breedError}
          isReadOnly={isReadOnly}
        />
      </motion.div>
    </div>
  )
}
