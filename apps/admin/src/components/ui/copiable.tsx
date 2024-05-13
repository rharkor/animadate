"use client"

import { useRef, useState } from "react"
import { ClipboardList } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Tooltip } from "@nextui-org/react"

import { CopiableDr } from "./copiable.dr"

export default function Copiable({
  text,
  isDisabled,
  className,
  classNames,
  dictionary,
  children,
  onClick,
  size,
}: {
  text: string | undefined
  isDisabled?: boolean
  className?: string
  classNames?: {
    text?: string
    button?: string
    icon?: string
    container?: string
  }
  dictionary: TDictionary<typeof CopiableDr>
  children?: React.ReactNode
  onClick?: (textRef: React.RefObject<HTMLParagraphElement>) => void
  size?: "sm" | "md"
}) {
  const [isCopied, setIsCopied] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setIsCopied(true)
    setIsTooltipOpen(true)
  }

  if (isTooltipOpen === false && isCopied) {
    setIsCopied(false)
  }

  const textRef = useRef(null)
  const selectText = () => {
    if (textRef.current) {
      const range = document.createRange()
      range.selectNode(textRef.current)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
  }

  return (
    <div className={cn("copiable group flex flex-row items-center gap-1", classNames?.container)}>
      <p
        className={cn(
          "block cursor-pointer rounded-small border border-foreground-300/20 bg-foreground-200/20 p-[3px] px-2 text-xs",
          {
            "pointer-events-none text-muted-foreground": isDisabled,
            "text-sm": size === "md",
          },
          className,
          classNames?.text
        )}
        ref={textRef}
        onClick={onClick ? () => onClick(textRef) : selectText}
      >
        {children ?? text}
      </p>
      <Tooltip
        isOpen={isTooltipOpen}
        onOpenChange={(open) => setIsTooltipOpen(open)}
        content={isCopied ? dictionary.copiedToClipboard : dictionary.copyToClipboard}
        isDisabled={isDisabled}
      >
        <Button
          className={cn(
            "block h-max min-h-[24px] min-w-0 cursor-pointer rounded-small border border-foreground-300/20 bg-[unset] p-1 px-3",
            "focus:border-primary focus:bg-foreground-200/20 focus:!outline-0",
            {
              "min-h-[28px]": size === "md",
            },
            classNames?.button
          )}
          isDisabled={isDisabled}
          onPress={() => {
            copyToClipboard(text)
          }}
        >
          <ClipboardList
            className={cn(
              "size-3.5",
              {
                "size-4": size === "md",
              },
              classNames?.icon
            )}
          />
        </Button>
      </Tooltip>
    </div>
  )
}
