import { headers } from "next/headers"

import { routes } from "@/constants/navigation"
import { TDictionary } from "@/lib/langs"

import { BottomBarDr } from "./bottom-bar.dr"
import BottomBarItem from "./bottom-bar-item"

export default function BottomBar({ dictionary }: { dictionary: TDictionary<typeof BottomBarDr> }) {
  const url = headers().get("x-url") || ""
  const pathname = new URL(url).pathname

  const resolvedRoutes = routes(dictionary, pathname)

  return (
    <nav className="w-screen overflow-auto bg-content1">
      <ul className="grid grid-cols-4 items-center gap-3">
        {resolvedRoutes.map((route, i) => (
          <BottomBarItem key={i} route={route} />
        ))}
      </ul>
    </nav>
  )
}
