import { Dispatch, SetStateAction } from "react"
import Link from "next/link"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"

import { TRoute } from "@/constants/navigation"
import { cn } from "@/lib/utils"
import { Avatar, Tooltip } from "@nextui-org/react"

export default function BottomBarItem({
  route,
  createRipple,
  setWillActive,
  active,
  ssrSession,
}: {
  route: TRoute
  createRipple: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  setWillActive: Dispatch<SetStateAction<string | undefined>>
  active: string | undefined
  ssrSession: Session
}) {
  const session = useSession().data ?? ssrSession

  const handleCreateRipple = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const leftOfButton = event.currentTarget.getBoundingClientRect().left
    event.clientX = event.clientX + leftOfButton

    createRipple(event)
  }

  const fallbackIcon = `https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=${session.user.name}&scale=75`

  return (
    <li>
      <Tooltip content={route.name} placement="top" className="max-sm:hidden">
        <Link
          href={route.route}
          className={cn(
            "flex h-max w-full min-w-0 flex-col items-center justify-center rounded-none px-4 py-2 text-foreground transition-transform",
            {
              "text-primary": route.isActive,
            },
            "!outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 active:scale-[0.97]",
            "sm:h-[60px] sm:w-[84px] sm:px-7"
          )}
          onClick={handleCreateRipple}
          onMouseEnter={() => setWillActive(route.id)}
          onMouseLeave={() => setWillActive(active)}
        >
          {route.icon && (
            <route.icon
              className={cn("size-5.5 sm:size-7", {
                "fill-primary": route.isActive,
              })}
            />
          )}
          {route.id === "profile" && (
            <Avatar
              src={session.user.image ?? fallbackIcon}
              showFallback={false}
              fallback={<></>}
              className={cn("!size-6 text-tiny", {
                "border border-primary": route.isActive,
              })}
            />
          )}
          <span className="text-xs sm:hidden">{route.name}</span>
        </Link>
      </Tooltip>
    </li>
  )
}
