import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/button"

function Comp({ children, href }: { children: React.ReactNode; href: string | undefined }) {
  if (href) {
    return <Link href={href}>{children}</Link>
  }

  return <React.Fragment>{children}</React.Fragment>
}

export default function Row({
  children,
  placement,
  className,
  color,
  href,
}: {
  children: React.ReactNode
  placement: "top" | "center" | "bottom" | "single"
  className?: string
  color?: "default" | "success" | "primary" | "secondary" | "warning" | "danger"
  href?: string
}) {
  return (
    <Comp href={href}>
      <Button
        className={cn(
          "h-max w-full min-w-0 justify-between rounded-large bg-content1 p-2 !text-medium",
          "!scale-100 text-primary data-[focus=true]:bg-primary/10",
          {
            "rounded-none": placement === "center",
            "rounded-t-none": placement === "bottom",
            "rounded-b-none": placement === "top",
            "border-b border-default-100": placement !== "bottom" && placement !== "single",
            "data-[focus=true]:bg-danger-100 data-[focus-visible=true]:outline-danger": color === "danger",
          },
          className
        )}
        variant="light"
        color={color ?? "primary"}
      >
        <span
          className={cn("flex flex-row items-center gap-2 text-foreground", {
            "text-danger": color === "danger",
          })}
        >
          {children}
        </span>
        <ChevronRight className="size-4 text-foreground" />
      </Button>
    </Comp>
  )
}
