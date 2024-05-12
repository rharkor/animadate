import { Home, LucideIcon, ScrollText } from "lucide-react"

import { TDictionary } from "@/lib/langs"

export type TRoute = {
  id: string
  name: string
  route: string
  icon: LucideIcon
  isActive: boolean
}

export const routes: (
  dictionary: TDictionary<{
    nav: true
  }>,
  pathname: string
) => TRoute[] = (dictionary, pathname) => [
  {
    id: "home",
    name: dictionary.nav.home,
    route: "/",
    icon: Home,
    isActive: pathname.match(/^\/[a-z]+\/?$/) !== null,
  },
  {
    id: "events",
    name: dictionary.nav.events,
    route: "/events",
    icon: ScrollText,
    isActive: pathname.match(/^\/[a-z]+\/events\/?$/) !== null,
  },
]
