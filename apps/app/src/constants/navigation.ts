import { Bell, Flame, LucideIcon, Map, User } from "lucide-react"

import { TDictionary } from "@/lib/langs"

export type TRoute = {
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
    name: dictionary.nav.match,
    route: "/",
    icon: Flame,
    isActive: pathname.match(/^\/[a-z]+\/?$/) !== null,
  },
  {
    name: dictionary.nav.activities,
    route: "/activities",
    icon: Map,
    isActive: pathname.match(/^\/[a-z]+\/activities\/?$/) !== null,
  },
  {
    name: dictionary.nav.notifications,
    route: "/notifications",
    icon: Bell,
    isActive: pathname.match(/^\/[a-z]+\/notifications\/?$/) !== null,
  },
  {
    name: dictionary.nav.profile,
    route: "/profile",
    icon: User,
    isActive: pathname.match(/^\/[a-z]+\/profile\/?$/) !== null,
  },
]
