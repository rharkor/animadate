"use client"

import { cn } from "@/lib/utils"

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
}

export default function EditableText({
  placeholder,
  value,
  onChange,
  className,
  classNames,
  ...props
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, keyof BaseProps>) {
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
          "overflow-hidden",
          classNames?.input
        )}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
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
