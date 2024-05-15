import Link from "next/link"

import { cn } from "@/lib/utils"

export default function SideBarItem({
  active,
  href,
  onPress,
  icon,
  children,
}: {
  active?: boolean
  href?: string
  onPress?: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const itemClassName = cn(
    "flex w-full flex-row justify-start gap-2 text-default-500 cursor-pointer tap-highlight-transparent outline-none rounded-large items-center",
    "px-3 py-2 min-h-11 text-default-500 transition-colors duration-200 ease-in-out hover:bg-default/40",
    "focus:bg-default/40 focus:outline-none focus:ring-2 focus:ring-primary",
    {
      "text-foreground bg-default-100": active,
    }
  )

  if (href)
    return (
      <Link href={href} className={itemClassName}>
        {icon}
        <span className="text-small font-medium">{children}</span>
      </Link>
    )

  return (
    <button onClick={onPress} className={itemClassName}>
      {icon}
      <span className="text-small font-medium">{children}</span>
    </button>
  )
}
