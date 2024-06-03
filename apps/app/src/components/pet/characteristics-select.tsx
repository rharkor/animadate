"use client"

import { useMemo, useState } from "react"
import { Plus, Shuffle, X } from "lucide-react"

import { maxPetCharacteristics, minPetCharacteristics } from "@/api/pet/schemas"
import { ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { CHARACTERISTIC } from "@animadate/app-db/generated/client"
import { logger } from "@animadate/lib"
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@nextui-org/react"

import { CharacteristicsSelectDr } from "./characteristics-select.dr"

export default function CharacteristicsSelect({
  dictionary,
  characteristics,
  setCharacteristics,
  error,
  clickDisabled,
  isReadOnly,
}: {
  dictionary: TDictionary<typeof CharacteristicsSelectDr>
  characteristics: string[]
  setCharacteristics?: (value: string[]) => void
  error?: string | null
  clickDisabled: boolean
  isReadOnly?: boolean
}) {
  const { isOpen, onOpen: _onOpen, onOpenChange } = useDisclosure()
  const onOpen = () => {
    if (!clickDisabled) _onOpen()
  }

  const _characteristicsChoices = useMemo(
    () =>
      Object.values(CHARACTERISTIC).map((c) => ({
        label: dictionary.petCharacteristics[c],
        value: c,
      })),
    [dictionary]
  )
  const [characteristicsChoices, setCharacteristicsChoices] = useState(_characteristicsChoices)

  const shuffleCharacteristics = () => {
    const shuffled = [...characteristicsChoices].sort(() => Math.random() - 0.5)
    setCharacteristicsChoices(shuffled)
  }

  const getCharacteristic = useMemo(() => {
    return (value: string) => {
      const res = characteristicsChoices.find((c) => c.value === value)
      if (!res) {
        logger.error(`Characteristic ${value} not found`)
        return { label: value, value }
      }
      return res
    }
  }, [characteristicsChoices])

  const addCharacteristics = (value: string) => {
    if (characteristics.length >= maxPetCharacteristics) return
    if (!characteristics.includes(value)) setCharacteristics?.([...characteristics, value])
  }

  const removeCharacteristics = (value: string) => {
    setCharacteristics?.(characteristics.filter((c) => c !== value))
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

  const translatedCharacteristics = useMemo(
    () => characteristics.map((c) => getCharacteristic(c)),
    [characteristics, getCharacteristic]
  )

  return (
    <div>
      {error && <p className="px-1 text-xs text-danger lg:hidden">{error}</p>}
      <div
        className={cn(
          "flex items-center gap-1",
          "p-1 text-foreground",
          "border-1 border-dashed border-transparent focus:border-primary focus:outline-none focus:ring-0",
          "lg:pointer-events-none lg:cursor-default lg:touch-none lg:border-none"
        )}
        {...(isReadOnly
          ? {}
          : {
              tabIndex: 0,
              role: "button",
              onClick: onOpen,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") onOpen()
              },
            })}
      >
        {translatedCharacteristics.map((c) => (
          <Chip
            size="sm"
            key={c.value}
            variant="flat"
            color="primary"
            className={cn("border-2 border-transparent", "focus:border-primary focus:outline-none focus:ring-0")}
          >
            {c.label}
          </Chip>
        ))}
        {!isReadOnly && (
          <Chip
            size="sm"
            color="primary"
            variant="bordered"
            className="lg:hidden"
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
        )}
      </div>
      {!isReadOnly && (
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
                  <div className="flex flex-col gap-2">
                    <p>{dictionary.currentPetCharacteristics}</p>
                    {error && <p className="text-xs text-danger">{error}</p>}
                    {characteristics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{dictionary.noCharacteristics}</p>
                    ) : (
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
                            {getCharacteristic(c).label}
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
      )}
    </div>
  )
}
