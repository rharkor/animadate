"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Images, RefreshCcw } from "lucide-react"
import { toast } from "react-toastify"

import { TDictionary } from "@/lib/langs"
import { logger } from "@animadate/lib"
import { Button, Link, Modal, ModalContent, Select, SelectItem } from "@nextui-org/react"

import { CameraProviderDr } from "./camera-provider.dr"
import { CameraContext } from "./context"

export default function CameraProvider({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary<typeof CameraProviderDr>
}) {
  const [_showModal, setShowModal] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoBgRef = useRef<HTMLVideoElement>(null)
  const [facingMode, _setFacingMode] = useState<"user" | "environment">("user")
  const sp = useSearchParams()
  const showModal = _showModal && sp.get("camera") === "true"
  const [openGalery, setOpenGalery] = useState<(() => void) | null>(null)

  const [handleClick, setHandleClick] = useState<(() => Promise<void>) | null>(null)

  const [videoSources, setVideoSources] = useState<MediaDeviceInfo[]>([])
  const [forcedCamera, setForcedCamera] = useState<string | null>(null)

  const hasCameraFlipping =
    videoSources.length === 2 &&
    videoSources.some((source) => source.label.includes("front")) &&
    videoSources.some((source) => source.label.includes("back"))

  const loadCameraStream = useCallback(
    async (_facingMode?: "user" | "environment") => {
      try {
        //* Get the list of video sources
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoSources = devices.filter((device) => device.kind === "videoinput")
        setVideoSources(videoSources)
        const _forcedCamera = forcedCamera ?? videoSources[0].deviceId
        if (!forcedCamera) {
          setForcedCamera(videoSources[0].deviceId)
        }
        //* Get the user media
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Check if the environment is secure
          if (location.protocol === "https:") {
            logger.error("getUserMedia is not supported in a secure environment")
            // Do not use dictionary here because this error will appear only in development
            toast.error("getUserMedia is not supported in a secure environment")
          }
        }
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: _facingMode ?? facingMode, deviceId: _forcedCamera ?? undefined },
        })
      } catch (error) {
        logger.error("Error accessing the camera:", error)
        return null
      }
    },
    [facingMode, forcedCamera]
  )

  const stopCameraStream = useCallback((stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (videoBgRef.current) {
      videoBgRef.current.srcObject = null
    }
    stream.getTracks().forEach((track) => track.stop())
    setStream(null)
  }, [])

  const reloadCameraStream = useCallback(
    async (facingMode?: "user" | "environment") => {
      if (!stream) return
      stopCameraStream(stream)
      const newStream = await loadCameraStream(facingMode)
      setStream(newStream)
    },
    [loadCameraStream, stopCameraStream, stream]
  )

  const onClose = useCallback(() => {
    setShowModal(false)
    // Go back to the previous page
    const sp = new URLSearchParams(location.search)
    sp.delete("camera")
    history.pushState(null, "", `${location.pathname}?${sp.toString()}`)
    if (!stream) return
    stopCameraStream(stream)
  }, [stopCameraStream, stream])

  const captureCameraSnapshot = useCallback(
    async (stream: MediaStream) => {
      return new Promise<File>((resolve, reject) => {
        const video = document.createElement("video")
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) return
        video.srcObject = stream
        video.onloadedmetadata = () => {
          video.play()
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Cannot take photo"))
            const file = new File([blob], "photo.png", { type: "image/png" })
            stopCameraStream(stream)
            resolve(file)
          })
        }
      })
    },
    [stopCameraStream]
  )

  const setFacingMode = useCallback(
    (facingMode: "user" | "environment") => {
      _setFacingMode(facingMode)
      //? Reload camera stream when facing mode changes
      reloadCameraStream(facingMode)
    },
    [reloadCameraStream]
  )

  const switchCamera = useCallback(() => {
    setFacingMode(facingMode === "user" ? "environment" : "user")
  }, [facingMode, setFacingMode])

  const takePhoto = useCallback(
    async (opts?: { openGalery?: (() => void) | null }): Promise<File> => {
      //? Push a route in history to prevent the user from going back to the previous page
      const sp = new URLSearchParams(location.search)
      sp.set("camera", "true")
      history.pushState(null, "", `${location.pathname}?${sp.toString()}`)

      const stream = await loadCameraStream()
      setStream(stream)
      setOpenGalery(() => {
        return opts?.openGalery ?? null
      })
      if (!stream) throw new Error("Cannot access camera")
      setShowModal(true)
      return new Promise<File>(async (resolve) => {
        setHandleClick(() => {
          return async () => {
            const file = await captureCameraSnapshot(stream)
            onClose()
            resolve(file)
          }
        })
      })
    },
    [loadCameraStream, captureCameraSnapshot, onClose]
  )

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((error) => logger.error("Error playing the video stream:", error))
    }
    if (videoBgRef.current) {
      videoBgRef.current.srcObject = stream
      videoBgRef.current.play().catch((error) => logger.error("Error playing the video stream:", error))
    }
  }, [stream])

  useEffect(() => {
    const video = sp.get("camera")
    if (video !== "true" && (stream || _showModal)) {
      onClose()
    }
  }, [sp, onClose, stream, _showModal])

  return (
    <CameraContext.Provider value={{ takePhoto, showModal, onClose }}>
      {children}
      <Modal
        isOpen={showModal}
        classNames={{
          wrapper: "z-[101]",
          backdrop: "z-[100]",
        }}
        size="full"
        hideCloseButton
        isDismissable={false}
      >
        <ModalContent className="flex flex-col">
          <div className="flex flex-row justify-between gap-2 border-b border-default-800 bg-default-900 p-1 py-2">
            <Link
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClose()
              }}
            >
              <ChevronLeft className="size-4" />
              {dictionary.close}
            </Link>
            {!hasCameraFlipping && videoSources.length > 1 ? (
              <Select
                selectedKeys={forcedCamera ? [forcedCamera] : undefined}
                onSelectionChange={(keys) => {
                  if (keys === "all") {
                    setForcedCamera(videoSources[0].deviceId)
                  } else {
                    const firstKey = Array.from(keys)[0]
                    if (!firstKey) return
                    setForcedCamera(firstKey.toString())
                  }
                  reloadCameraStream()
                }}
                aria-label={"Camera"}
                classNames={{
                  trigger: "p-0 w-max min-h-0 h-max bg-transparent border-none",
                  selectorIcon: "hidden",
                  innerWrapper: "w-full",
                  mainWrapper: "w-max",
                  base: "w-max",
                  value: "text-medium !text-muted/70",
                }}
                className=""
                selectionMode="single"
              >
                {videoSources.map((source) => (
                  <SelectItem key={source.deviceId} value={source.deviceId}>
                    {source.label}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <div />
            )}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <video ref={videoRef} className="relative z-10 h-full object-contain" />
            <video
              ref={videoBgRef}
              className="absolute left-0 top-0 z-0 size-full scale-110 bg-black object-cover blur"
            />
          </div>
          <div className="flex flex-row items-center justify-evenly border-t border-default-800 bg-default-900 p-1 py-2">
            {openGalery ? (
              <Button
                onClick={openGalery}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openGalery()
                }}
                variant="flat"
                className="!size-12 min-w-0 rounded-full border border-default-600 p-3"
              >
                <Images className="size-6" />
              </Button>
            ) : (
              <div className="size-12" />
            )}
            <Button
              onClick={() => handleClick?.()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick?.()
              }}
              className="!size-20 min-w-0 rounded-full border-none bg-white"
            />
            {hasCameraFlipping ? (
              <Button
                variant="flat"
                className="my-auto !size-12 min-w-0 rounded-full border-none p-3"
                onClick={switchCamera}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") switchCamera()
                }}
              >
                <RefreshCcw className="size-6" />
              </Button>
            ) : (
              <div className="size-12" />
            )}
          </div>
        </ModalContent>
      </Modal>
    </CameraContext.Provider>
  )
}
