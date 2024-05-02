"use client"

import { chain, cn } from "@/lib/utils"

type BaseProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => string
  className?: string
  classNames?: {
    input?: string
    paragraph?: string
    container?: string
  }
  onlyNumbers?: boolean
  maxDigits?: number
  firstLetterUppercase?: boolean
  multiline?: boolean
  maxLines?: number
}

const numberRegex = /^\d*$/

export default function EditableText({
  placeholder,
  value,
  onChange,
  className,
  classNames,
  onlyNumbers,
  maxDigits,
  firstLetterUppercase,
  multiline,
  maxLines,
  ...props
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, keyof BaseProps>) {
  const preprocessValue = (newValue: string) => {
    //* Breaking constraints
    // Only numbers
    if (onlyNumbers && !numberRegex.test(newValue)) return value

    //* Mutating constraints
    // No multiline by default
    if (!multiline && newValue.includes("\n")) newValue = newValue.replace(/\n/g, "")
    // Max lines
    if (maxLines) {
      const lines = newValue.split("\n")
      if (lines.length > maxLines) newValue = lines.slice(0, maxLines).join("\n")
    }
    // Max digits
    if (maxDigits && newValue.length > maxDigits) newValue = newValue.substring(0, maxDigits)
    // First letter uppercase
    if (firstLetterUppercase) newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1)
    return newValue
  }

  return (
    <div
      className={cn(
        "relative rounded-medium border-2 border-transparent p-1 text-foreground focus-within:border-primary",
        className,
        classNames?.container
      )}
    >
      <textarea
        className={cn(
          "absolute inset-0 z-10 size-full cursor-text resize-none overflow-auto p-1",
          "border-none bg-transparent focus:outline-none focus:ring-0",
          "placeholder-default-400",
          classNames?.input
        )}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(e) => chain(preprocessValue, onChange)(e.target.value)}
        {...props}
      />
      <p
        className={cn(
          "opacity-0",
          {
            "text-default-400": !value,
          },
          classNames?.paragraph
        )}
      >
        {value || placeholder}
      </p>
    </div>
  )
}
