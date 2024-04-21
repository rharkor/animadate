import Link from "next/link"

import { TRoute } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export default function BottomBarItem({
  route,
  createRipple,
}: {
  route: TRoute
  createRipple: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}) {
  const handleCreateRipple = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const leftOfButton = event.currentTarget.getBoundingClientRect().left
    event.clientX = event.clientX + leftOfButton

    createRipple(event)
  }

  return (
    <li>
      <Link
        href={route.route}
        className={cn(
          "flex h-max w-full min-w-0 flex-col items-center justify-center rounded-none px-4 py-2 text-foreground transition-all",
          {
            "text-primary": route.isActive,
          },
          "active:scale-[0.97]"
        )}
        onClick={handleCreateRipple}
      >
        <route.icon
          className={cn("size-5.5", {
            "fill-primary": route.isActive,
          })}
        />
        <span className="text-xs">{route.name}</span>
      </Link>
    </li>
  )
}
