"use client"

import { useEffect, useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { z } from "zod"

import { getEventsSchema } from "@/api/events/schemas"
import { TDictionary } from "@/lib/langs"
import { kinds as sdkKinds, levels as sdkLevels } from "@animadate/events-sdk/dist/sdk/types"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@nextui-org/react"

import { TableTopContentDr } from "./table-top-content.dr"

type TKinds = z.infer<ReturnType<typeof getEventsSchema>>["kinds"]
type TLevels = z.infer<ReturnType<typeof getEventsSchema>>["levels"]

export default function TableTopContent({
  dictionary,
  kinds,
  setKinds,
  levels,
  setLevels,
  name,
  setName,
  application,
  setApplication,
}: {
  dictionary: TDictionary<typeof TableTopContentDr>
  name: string
  setName: (name: string) => void
  kinds: TKinds
  setKinds: (kinds: TKinds) => void
  levels: TLevels
  setLevels: (levels: TLevels) => void
  application: string
  setApplication: (application: string) => void
}) {
  const [nameDebounced, setNameDebounced] = useState(name)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setName(nameDebounced)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [nameDebounced, setName])

  const [applicationDebounced, setApplicationDebounced] = useState(application)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setApplication(applicationDebounced)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [applicationDebounced, setApplication])

  return (
    <div className="flex items-end justify-between gap-3">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder={dictionary.searchByName}
        startContent={<SearchIcon />}
        value={nameDebounced}
        onClear={() => setNameDebounced("")}
        onValueChange={setNameDebounced}
      />
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder={dictionary.searchByApplicationName}
        startContent={<SearchIcon />}
        value={applicationDebounced}
        onClear={() => setApplicationDebounced("")}
        onValueChange={setApplicationDebounced}
      />
      <div className="flex gap-3">
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
              {dictionary.kinds}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label={dictionary.kinds}
            closeOnSelect={false}
            selectedKeys={kinds}
            selectionMode="multiple"
            onSelectionChange={(value) => setKinds(Array.from(value) as TKinds)}
          >
            {sdkKinds.map((kind) => (
              <DropdownItem key={kind}>{kind}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
              {dictionary.levels}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label={dictionary.levels}
            closeOnSelect={false}
            selectedKeys={levels}
            selectionMode="multiple"
            onSelectionChange={(value) => setLevels(Array.from(value) as TLevels)}
          >
            {sdkLevels.map((level) => (
              <DropdownItem key={level}>{level}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}
