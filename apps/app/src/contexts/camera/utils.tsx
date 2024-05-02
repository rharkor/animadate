"use client"
import { useContext } from "react"

import { CameraContext } from "./context"

export const useCamera = () => {
  const context = useContext(CameraContext)
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider")
  }
  return context
}
