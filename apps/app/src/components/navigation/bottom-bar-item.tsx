import { Dispatch, SetStateAction } from "react"
import Link from "next/link"

import { TRoute } from "@/constants/navigation"
import { cn } from "@/lib/utils"
import { Tooltip } from "@nextui-org/react"

export default function BottomBarItem({
  route,
  createRipple,
  setWillActive,
  active,
}: {
  route: TRoute
  createRipple: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  setWillActive: Dispatch<SetStateAction<string | undefined>>
  active: string | undefined
}) {
  const handleCreateRipple = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const leftOfButton = event.currentTarget.getBoundingClientRect().left
    event.clientX = event.clientX + leftOfButton

    createRipple(event)
  }

  return (
    <li>
      <Tooltip content={route.name} placement="top" className="max-sm:hidden">
        <Link
          href={route.route}
          className={cn(
            "flex h-max w-full min-w-0 flex-col items-center justify-center rounded-none px-4 py-2 text-foreground transition-all",
            {
              "text-primary": route.isActive,
            },
            "active:scale-[0.97]",
            "sm:h-[60px] sm:w-[84px] sm:px-7"
          )}
          onClick={handleCreateRipple}
          onMouseEnter={() => setWillActive(route.id)}
          onMouseLeave={() => setWillActive(active)}
        >
          <route.icon
            className={cn("size-5.5 sm:size-7", {
              "fill-primary": route.isActive,
            })}
          />
          <span className="text-xs sm:hidden">{route.name}</span>
        </Link>
      </Tooltip>
    </li>
  )
}
