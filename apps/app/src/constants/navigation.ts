import { Bell, Flame, LucideIcon, Map } from "lucide-react"

import { TDictionary } from "@/lib/langs"

export type TRoute = {
  id: string
  name: string
  route: string
  icon?: LucideIcon
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
    name: dictionary.nav.match,
    route: "/",
    icon: Flame,
    isActive: pathname.match(/^\/[a-z]+\/?$/) !== null,
  },
  {
    id: "activities",
    name: dictionary.nav.activities,
    route: "/activities",
    icon: Map,
    isActive: pathname.match(/^\/[a-z]+\/activities\/?$/) !== null,
  },
  {
    id: "notifications",
    name: dictionary.nav.notifications,
    route: "/notifications",
    icon: Bell,
    isActive: pathname.match(/^\/[a-z]+\/notifications\/?$/) !== null,
  },
  {
    id: "profile",
    name: dictionary.nav.profile,
    route: "/profile",
    isActive: pathname.match(/^\/[a-z]+\/profile\/?$/) !== null,
  },
]
