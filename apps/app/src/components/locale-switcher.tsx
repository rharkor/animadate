"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

import { Locale, localesDetailed } from "@/lib/i18n-config"
import { cn } from "@/lib/utils"
import { Avatar, Select, SelectItem, Spinner } from "@nextui-org/react"

export default function LocaleSwitcher({
  lang,
  size = "sm",
  className,
}: {
  lang: Locale
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const pathName = usePathname()
  const router = useRouter()
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return "/"
    const segments = pathName.split("/")
    segments[1] = locale
    return segments.join("/")
  }

  const handleLocaleChange = (locale: Locale) => {
    router.push(redirectedPathName(locale))
    //? refresh the page due to prefetch <Link/>
    router.refresh()
  }

  const [dynamicLocale, setDynamicLocale] = useState<Locale>(lang)
  const isLoading = dynamicLocale !== lang

  if (!localesDetailed[lang]) return null

  return (
    <Select
      selectedKeys={[dynamicLocale]}
      onChange={(e) => {
        const locale = e.target.value as Locale | undefined
        if (!locale) return
        handleLocaleChange(locale)
        setDynamicLocale(locale)
      }}
      className={cn("w-[150px]", className)}
      classNames={{
        innerWrapper: cn({
          "gap-3": size === "lg",
        }),
      }}
      aria-label={localesDetailed[lang].nativeName}
      startContent={
        isLoading ? (
          <Spinner
            classNames={{
              wrapper: cn("shrink-0", {
                "!size-4": size === "sm",
                "!size-5": size === "md",
                "!size-6": size === "lg",
              }),
            }}
            color="current"
          />
        ) : (
          <Avatar
            alt={lang}
            className={cn("shrink-0", {
              "!size-4": size === "sm",
              "!size-5": size === "md",
              "!size-6": size === "lg",
            })}
            src={localesDetailed[lang].flag}
          />
        )
      }
      size={size}
      selectionMode="single"
    >
      {Object.entries(localesDetailed).map(([locale, details]) => (
        <SelectItem
          key={locale}
          value={locale}
          startContent={<Avatar alt={locale} className="!size-6" src={details.flag} />}
        >
          {details.nativeName}
        </SelectItem>
      ))}
    </Select>
  )
}
