"use client"

import { Pen } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Chip } from "@nextui-org/react"

import { BreedSelectDr } from "./breed-select.dr"
import EditableText from "./editable-text"

export default function BreedSelect({
  dictionary,
  breed,
  setBreed,
  error,
}: {
  dictionary: TDictionary<typeof BreedSelectDr>
  breed: string
  setBreed: (value: string) => string
  error: string | null
}) {
  return (
    <div>
      {error && <p className="px-1 text-xs text-danger">{error}</p>}
      <Chip size="sm" color="primary" className="m-[5px] ml-0">
        <label className="flex items-center">
          {!breed && <Pen className="mr-1 size-3" />}
          <EditableText
            type="text"
            value={breed}
            onChange={(value) => setBreed(value)}
            placeholder={dictionary.graspBreed}
            classNames={{
              input: "text-primary-foreground placeholder:text-primary-foreground focus:placeholder:opacity-0",
            }}
            className="border-none"
          />
        </label>
      </Chip>
    </div>
  )
}
