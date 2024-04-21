"use client"

import { usePathname } from "next/navigation"

import { routes } from "@/constants/navigation"
import { TDictionary } from "@/lib/langs"
import { Ripple, useRipple } from "@nextui-org/react"

import { BottomBarDr } from "./bottom-bar.dr"
import BottomBarItem from "./bottom-bar-item"

// Do not SSR this function because the active route will not be update on client side
export default function BottomBar({ dictionary }: { dictionary: TDictionary<typeof BottomBarDr> }) {
  const pathname = usePathname()
  const ripple = useRipple()

  const resolvedRoutes = routes(dictionary, pathname)

  return (
    <nav className="relative w-screen overflow-hidden bg-content1 shadow">
      <ul className="grid grid-cols-4 items-center gap-3">
        {resolvedRoutes.map((route, i) => (
          <BottomBarItem key={i} route={route} createRipple={ripple.onClick} />
        ))}
      </ul>
      <Ripple onClear={ripple.onClear} ripples={ripple.ripples} />
    </nav>
  )
}
