"use client"
import { createContext } from "react"

export type CameraContextType = {
  takePhoto: (opts?: { openGalery?: (() => void) | null }) => Promise<File>
  showModal: boolean
  onClose: () => void
}

export const CameraContext = createContext<CameraContextType | null>(null)
