"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Plus, Shuffle, X } from "lucide-react"

import { maxPetCharacteristics } from "@/api/pet/schemas"
import { CHARACTERISTIC } from "@/generated/client"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Chip, Input, Textarea } from "@nextui-org/react"

import { DesktopFormDr } from "./desktop-form.dr"

export default function DesktopForm({
  dictionary,
  hasPetProfile,
  petName,
  onPetNameChange,
  petAge,
  onPetAgeChange,
  description,
  onDescriptionChange,
  breed,
  onBreedChange,
  characteristics,
  onCharacteristicsChange,
  breedError,
  characteristicsError,
  ageError,
  descriptionError,
  nameError,
  isLoading,
}: {
  dictionary: TDictionary<typeof DesktopFormDr>
  hasPetProfile: boolean
  petName: string
  onPetNameChange: (value: string) => void
  petAge: string
  onPetAgeChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  breed: string
  onBreedChange: (value: string) => void
  characteristics: string[]
  onCharacteristicsChange: (value: string[]) => void
  breedError: string | null
  characteristicsError: string | null
  nameError: string | null
  ageError: string | null
  descriptionError: string | null
  isLoading: boolean
}) {
  const _characteristicsChoices = useMemo(
    () =>
      Object.values(CHARACTERISTIC)
        .map((c) => ({
          label: dictionary.petCharacteristics[c],
          value: c,
        }))
        .reduce(
          (acc, c) => {
            //? Remove label duplicates
            if (!acc.find((a) => a.label === c.label)) acc.push(c)
            return acc
          },
          [] as { label: string; value: string }[]
        ),
    [dictionary]
  )
  const [characteristicsChoices, setCharacteristicsChoices] = useState(_characteristicsChoices)

  const shuffleCharacteristics = () => {
    const shuffled = [...characteristicsChoices].sort(() => Math.random() - 0.5)
    setCharacteristicsChoices(shuffled)
  }

  const getCharacteristic = useMemo(() => {
    return (value: string) => characteristicsChoices.find((c) => c.value === value)
  }, [characteristicsChoices])

  const addCharacteristics = (value: string) => {
    if (characteristics.length >= maxPetCharacteristics) return
    if (!characteristics.includes(value)) onCharacteristicsChange([...characteristics, value])
  }

  const removeCharacteristics = (value: string) => {
    onCharacteristicsChange(characteristics.filter((c) => c !== value))
  }

  const [search, setSearch] = useState("")

  const items = useMemo(
    () =>
      characteristicsChoices.map((c) => ({
        value: c.value,
        label: c.label,
        selected: characteristics.includes(c.value),
      })),
    [characteristicsChoices, characteristics]
  )

  const filteredItems = useMemo(
    () => items.filter((c) => !c.selected).filter((c) => c.label.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  )

  return (
    <section className="flex flex-1 flex-col gap-3 p-3 max-lg:hidden">
      <Button
        as={Link}
        href={"/profile"}
        variant="flat"
        className={cn("z-[70] w-max max-lg:hidden", {
          hidden: !hasPetProfile,
        })}
        size="sm"
        startContent={<ChevronLeft className="size-4" />}
      >
        {dictionary.back}
      </Button>
      <h2 className={cn("mb-3 text-xl font-medium uppercase text-muted-foreground max-lg:hidden")}>
        {dictionary.petProfile}
      </h2>
      <div className="flex gap-2">
        <Input
          type="text"
          name="name"
          label={dictionary.petName}
          value={petName}
          onChange={(e) => onPetNameChange(e.target.value)}
          className="w-[unset] flex-1"
          isInvalid={!!nameError}
          errorMessage={nameError}
        />
        <Input
          type="number"
          name="age"
          label={dictionary.age}
          value={petAge}
          onChange={(e) => onPetAgeChange(e.target.value)}
          className="w-[150px]"
          isInvalid={!!ageError}
          errorMessage={ageError}
        />
      </div>
      <Textarea
        name="description"
        label={dictionary.description}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="min-h-[100px]"
        isInvalid={!!descriptionError}
        errorMessage={descriptionError}
      />
      <Input
        type="text"
        name="breed"
        label={dictionary.breed}
        value={breed}
        onChange={(e) => onBreedChange(e.target.value)}
        isInvalid={!!breedError}
        errorMessage={breedError}
      />
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <p>{dictionary.currentPetCharacteristics}</p>
          {characteristicsError && <p className="text-xs text-danger">{characteristicsError}</p>}
          {characteristics.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dictionary.noCharacteristics}</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {characteristics.map((c) => (
                <Chip
                  size="sm"
                  color="primary"
                  variant="solid"
                  key={c}
                  onClick={() => removeCharacteristics(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") removeCharacteristics(c)
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn("border-2 border-transparent", "focus:border-primary focus:outline-none focus:ring-0")}
                  startContent={<X className="mr-1 size-3" />}
                >
                  {getCharacteristic(c)?.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
        <Input
          label={dictionary.searchPetCharacteristics}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
        <div className="flex flex-wrap gap-1">
          {filteredItems.slice(0, 7).map((c) => (
            <Chip
              size="sm"
              key={c.value}
              onClick={() => addCharacteristics(c.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") addCharacteristics(c.value)
              }}
              role="button"
              tabIndex={0}
              className={cn("border-2 border-transparent", "focus:border-primary focus:outline-none focus:ring-0")}
              startContent={<Plus className="mr-1 size-3" />}
            >
              {c.label}
            </Chip>
          ))}
          {filteredItems.length > 7 && (
            <Chip
              size="sm"
              onClick={shuffleCharacteristics}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") shuffleCharacteristics()
              }}
              role="button"
              variant="solid"
              color="primary"
              tabIndex={0}
              classNames={{
                content: "flex items-center",
              }}
              className="border-2 border-transparent focus:border-default-600 focus:outline-none focus:ring-0"
            >
              <Shuffle className="mr-1 size-3" />
              {dictionary.shuffle}
            </Chip>
          )}
        </div>
      </div>
      <Button color="success" type="submit" isLoading={isLoading} className="mx-auto mt-3">
        {dictionary.save}
      </Button>
    </section>
  )
}
