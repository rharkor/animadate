import { Dispatch, SetStateAction } from "react"
import Link from "next/link"

import { TRoute } from "@/constants/navigation"
import { useAccount } from "@/contexts/account"
import { cn } from "@/lib/utils"
import { getFallbackAvatar, getImageUrl } from "@/lib/utils/client-utils"
import { Avatar, Tooltip } from "@nextui-org/react"

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
  const account = useAccount()

  const handleCreateRipple = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const leftOfButton = event.currentTarget.getBoundingClientRect().left
    event.clientX = event.clientX + leftOfButton

    createRipple(event)
  }

  const fallbackIcon = account.data?.user.name ? getFallbackAvatar(account.data.user.name) : undefined

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
              src={account.data ? getImageUrl(account.data.user.profilePicture) ?? fallbackIcon : undefined}
              className={cn("!size-6 text-tiny", {
                "border border-primary": route.isActive,
              })}
              fallback={<></>}
            />
          )}
          <span className="text-xs sm:hidden">{route.name}</span>
        </Link>
      </Tooltip>
    </li>
  )
}
