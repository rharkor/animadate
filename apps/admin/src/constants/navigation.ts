import { AlertCircle, KeyRound, LucideIcon, Map, ScrollText } from "lucide-react"

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
    id: "map",
    name: dictionary.nav.map,
    route: "/",
    icon: Map,
    isActive: pathname.match(/^\/[a-z]+\/?$/) !== null,
  },
  {
    id: "events",
    name: dictionary.nav.events,
    route: "/events",
    icon: ScrollText,
    isActive: pathname.match(/^\/[a-z]+\/events\/?$/) !== null,
  },
  {
    id: "keys",
    name: dictionary.nav.apiKeys,
    route: "/keys",
    icon: KeyRound,
    isActive: pathname.match(/^\/[a-z]+\/keys\/?$/) !== null,
  },
  {
    id: "email-contacts",
    name: dictionary.nav.emailContacts,
    route: "/email-contacts",
    icon: AlertCircle,
    isActive: pathname.match(/^\/[a-z]+\/email-contacts\/?$/) !== null,
  },
]
