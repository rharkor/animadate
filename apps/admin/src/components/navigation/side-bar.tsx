"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { routes } from "@/constants/navigation"
import { fontMono } from "@/lib/fonts"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, ScrollShadow } from "@nextui-org/react"

import Logo from "../logo"

import { SideBarDr } from "./side-bar.dr"
import SideBarItem from "./side-bar-item"
import SignOut from "./sign-out"

export default function SideBar({ dictionary }: { dictionary: TDictionary<typeof SideBarDr> }) {
  const pathname = usePathname()

  const resolvedRoutes = routes(dictionary, pathname)

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <div className="fixed left-3 top-3 z-40 lg:hidden">
        <Button color="primary" onPress={() => setIsOpen(!isOpen)} className="h-max min-w-0 p-2">
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      <section
        className={cn(
          "z-30 flex h-screen w-72 flex-col border-r-small border-r-divider bg-white p-6",
          "max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:translate-x-[-100%] max-lg:transition-all max-lg:duration-200 max-lg:ease-in-out",
          {
            "max-lg:translate-x-0": isOpen,
          }
        )}
      >
        <div className="flex flex-row items-center gap-3 max-lg:mt-12">
          <Logo className="size-8" />
          <p className={cn("text-2xl font-medium", fontMono.className)}>{dictionary.name}</p>
        </div>
        <ScrollShadow className="flex-1 py-8 lg:py-[10vh]">
          <nav className="flex flex-col gap-0.5 p-1">
            {resolvedRoutes.map((route) => (
              <SideBarItem
                key={route.id}
                href={route.route}
                icon={<route.icon className="size-6" />}
                active={route.isActive}
              >
                {route.name}
              </SideBarItem>
            ))}
          </nav>
        </ScrollShadow>
        <div>
          <SignOut dictionary={dictionary} />
        </div>
      </section>
      <div
        className={cn("fixed left-0 top-0 z-20 h-full w-full bg-black/20", {
          hidden: !isOpen,
        })}
        onClick={() => setIsOpen(false)}
      />
    </>
  )
}
