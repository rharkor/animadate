import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

export default function Row({
  children,
  placement,
  className,
  color,
}: {
  children: React.ReactNode
  placement: "top" | "center" | "bottom" | "single"
  className?: string
  color?: "default" | "success" | "primary" | "secondary" | "warning" | "danger"
}) {
  return (
    <Button
      className={cn(
        "h-max w-full min-w-0 justify-between rounded-large bg-content1 p-2 !text-medium",
        "!scale-100 text-primary data-[focus=true]:bg-primary/10",
        {
          "rounded-none": placement === "center",
          "rounded-t-none": placement === "bottom",
          "rounded-b-none": placement === "top",
          "data-[focus=true]:bg-danger-100 data-[focus-visible=true]:outline-danger": color === "danger",
        },
        className
      )}
      variant="light"
      color={color ?? "primary"}
    >
      <span
        className={cn("text-foreground", {
          "text-danger": color === "danger",
        })}
      >
        {children}
      </span>
      <ChevronRight className="size-4 text-foreground" />
    </Button>
  )
}
