import { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import Link from "next/link"
import { z } from "zod"

import { getAccountResponseSchema } from "@/api/me/schemas"
import { TRoute } from "@/constants/navigation"
import { useAccount } from "@/hooks/account"
import { cn } from "@/lib/utils"
import { getFallbackAvatar, getImageUrl } from "@/lib/utils/client-utils"
import { Tooltip } from "@nextui-org/react"

export default function BottomBarItem({
  route,
  createRipple,
  setWillActive,
  active,
  ssrAccount,
}: {
  route: TRoute
  createRipple: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  setWillActive: Dispatch<SetStateAction<string | undefined>>
  active: string | undefined
  ssrAccount: z.infer<ReturnType<typeof getAccountResponseSchema>>
}) {
  const account = useAccount().data ?? ssrAccount

  const handleCreateRipple = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const leftOfButton = event.currentTarget.getBoundingClientRect().left
    event.clientX = event.clientX + leftOfButton

    createRipple(event)
  }

  const fallbackIcon = getFallbackAvatar(account.user.name)

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
            <Image
              src={getImageUrl(account.user.profilePicture) ?? fallbackIcon}
              alt="Profile Picture"
              className={cn("!size-6 rounded-full bg-content3 object-cover", {
                "border-2 border-primary": route.isActive,
              })}
              width={48}
              height={48}
            />
          )}
          <span className="text-xs sm:hidden">{route.name}</span>
        </Link>
      </Tooltip>
    </li>
  )
}
