"use client"

import { useRouter } from "next/navigation"

import { NextUIProvider } from "@nextui-org/system"

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <NextUIProvider navigate={router.push} className="flex h-full flex-row">
      {children}
    </NextUIProvider>
  )
}
