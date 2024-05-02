"use client"

import { useMemo, useState } from "react"
import { Plus, Shuffle, X } from "lucide-react"

import { maxPetCharacteristics, minPetCharacteristics } from "@/api/pet/schemas"
import { ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@nextui-org/react"
import { CHARACTERISTIC } from "@prisma/client"

import { CharacteristicsSelectDr } from "./characteristics-select.dr"

export default function CharacteristicsSelect({
  dictionary,
  characteristics,
  setCharacteristics,
}: {
  dictionary: TDictionary<typeof CharacteristicsSelectDr>
  characteristics: string[]
  setCharacteristics: (value: string[]) => void
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

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
    if (!characteristics.includes(value)) setCharacteristics([...characteristics, value])
  }

  const removeCharacteristics = (value: string) => {
    setCharacteristics(characteristics.filter((c) => c !== value))
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
    <>
      <div
        className={cn(
          "flex w-full items-center gap-1",
          "overflow-auto rounded-medium p-1 text-foreground",
          "border-1 border-dashed border-transparent focus:border-primary focus:outline-none focus:ring-0"
        )}
        tabIndex={0}
        role="button"
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen()
        }}
      >
        {characteristics.map((c) => (
          <Chip
            size="sm"
            key={c}
            variant="flat"
            color="primary"
            className={cn("border-2 border-transparent", "focus:border-primary focus:outline-none focus:ring-0")}
          >
            {getCharacteristic(c)?.label ?? c}
          </Chip>
        ))}
        <Chip
          size="sm"
          color="primary"
          classNames={{
            content: "flex items-center",
          }}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpen()
          }}
          role="button"
          tabIndex={0}
        >
          <Plus className="mr-1 size-3" />
          {dictionary.petAddCharacteristic}
        </Chip>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: "z-[71]",
          backdrop: "z-[70]",
        }}
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.petCharacteristicsLiteral}</ModalTitle>
                <ModalDescription>
                  {dictionary.selectTraitsDescription
                    .replace("{min}", minPetCharacteristics.toString())
                    .replace("{max}", maxPetCharacteristics.toString())}
                </ModalDescription>
              </ModalHeader>
              <ModalBody className="mb-4">
                <p>{dictionary.currentPetCharacteristics}</p>
                <div className="flex flex-wrap gap-1">
                  {characteristics.map((c) => (
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      key={c}
                      onClick={() => removeCharacteristics(c)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") removeCharacteristics(c)
                      }}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "border-2 border-transparent",
                        "focus:border-primary focus:outline-none focus:ring-0"
                      )}
                      startContent={<X className="mr-1 size-3" />}
                    >
                      {getCharacteristic(c)?.label}
                    </Chip>
                  ))}
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
                      className={cn(
                        "border-2 border-transparent",
                        "focus:border-primary focus:outline-none focus:ring-0"
                      )}
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
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  {dictionary.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
