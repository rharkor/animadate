"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { routes } from "@/constants/navigation"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Ripple, useRipple } from "@nextui-org/react"

import { BottomBarDr } from "./bottom-bar.dr"
import BottomBarItem from "./bottom-bar-item"

// Do not SSR this function because the active route will not be update on client side
export default function BottomBar({ dictionary }: { dictionary: TDictionary<typeof BottomBarDr> }) {
  const pathname = usePathname()
  const ripple = useRipple()

  const resolvedRoutes = routes(dictionary, pathname)

  const active = resolvedRoutes.find((route) => route.isActive)?.id
  const [willActive, setWillActive] = useState(active)

  useEffect(() => {
    setWillActive(active)
  }, [active])

  const getRouteIndexById = (id: string) => resolvedRoutes.findIndex((route) => route.id === id)

  return (
    <nav
      className={cn(
        "relative w-screen overflow-hidden bg-content1 shadow",
        "sm:mx-auto sm:mb-4 sm:w-max sm:rounded-full sm:border sm:border-content2 sm:px-4"
      )}
    >
      <ul className="relative z-10 grid grid-cols-4 items-center gap-3 sm:gap-0">
        {resolvedRoutes.map((route, i) => (
          <BottomBarItem
            key={i}
            route={route}
            createRipple={ripple.onClick}
            active={active}
            setWillActive={setWillActive}
          />
        ))}
      </ul>
      <Ripple className="sm:hidden" onClear={ripple.onClear} ripples={ripple.ripples} />

      {/* Desktop anim */}
      <motion.div
        className={cn(
          "absolute left-[23px] top-[calc(50%-22.5px)] z-0 h-[45px] w-[70px] rounded-full bg-primary/30 backdrop-blur-lg max-sm:hidden"
        )}
        style={{
          translateX: active ? getRouteIndexById(active) * 84 : 0,
        }}
        animate={{
          translateX: willActive || active ? `${getRouteIndexById((willActive ?? active) as string) * 84}px` : "0px",
        }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
      />
    </nav>
  )
}
