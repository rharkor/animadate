"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Input } from "@nextui-org/react"

import AddEmailContact from "./add-email"
import { TableTopContentDr } from "./table-top-content.dr"

export default function TableTopContent({
  dictionary,
  email,
  setEmail,
}: {
  dictionary: TDictionary<typeof TableTopContentDr>
  email: string
  setEmail: (email: string) => void
}) {
  const [emailDebounced, setEmailDebounced] = useState(email)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setEmail(emailDebounced)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [emailDebounced, setEmail])

  return (
    <div className="flex items-end justify-between gap-3">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder={dictionary.searchByEmail}
        startContent={<SearchIcon />}
        value={emailDebounced}
        onClear={() => setEmailDebounced("")}
        onValueChange={setEmailDebounced}
      />
      <div className="flex gap-3">
        <AddEmailContact dictionary={dictionary} />
      </div>
    </div>
  )
}
