import { useEffect, useState } from "react"
import { getSelectorsByUserAgent } from "react-device-detect"

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const { isMobile } = getSelectorsByUserAgent(userAgent ?? "")
    setIsMobile(isMobile)
  }, [])
  return isMobile
}
