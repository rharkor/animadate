import { TRoute } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export default function BottomBarItem({ route }: { route: TRoute }) {
  return (
    <li
      className={cn("flex flex-col items-center justify-center px-4 py-2", {
        "text-primary": route.isActive,
      })}
    >
      <route.icon />
      <span className="text-xs">{route.name}</span>
    </li>
  )
}
