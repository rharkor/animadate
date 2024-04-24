"use client"

import { useTheme } from "next-themes"
import { ToastContainer as OToaster } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"

export default function Toaster() {
  const { resolvedTheme, forcedTheme } = useTheme()
  return <OToaster theme={forcedTheme ?? (resolvedTheme === "dark" ? "dark" : "light")} />
}
