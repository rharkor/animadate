"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useMotionValue } from "framer-motion"
import { ImageUp } from "lucide-react"

import { maxPetPhotos, minPetPhotos } from "@/api/pet/schemas"
import { petProfileImagesPlaceholder } from "@/constants/medias"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"

import { PhotosDisplayDr } from "./photos-display.dr"

interface Photo {
  key: string
  url: string
}

interface PhotosDisplayProps {
  photos: Photo[]
  photoIndex: number
  setPhotoIndex: (index: number) => void
  dictionary: TDictionary<typeof PhotosDisplayDr>
  setShowUploadModal: (show: boolean) => void
  carousel?: boolean
  defaultPhoto: number
}

export default function PhotosDisplay({
  photos,
  photoIndex,
  setPhotoIndex,
  dictionary,
  setShowUploadModal,
  carousel,
  defaultPhoto,
}: PhotosDisplayProps) {
  //* Swipe
  const x = useMotionValue(0)

  const canAddPhoto = photos.length < maxPetPhotos
  const realPhotosLength = canAddPhoto ? photos.length + 1 : photos.length

  // Minimum distance (in pixels) to trigger swipe
  const minSwipeDistance = 70

  const onDragEnd = (_: MouseEvent | TouchEvent, info: { offset: { x: number } }) => {
    const distance = Math.abs(info.offset.x)
    if (distance > minSwipeDistance) {
      if (info.offset.x > 0) {
        // Swipe right
        setPhotoIndex(photoIndex === 0 ? 0 : photoIndex - 1)
      } else {
        // Swipe left
        setPhotoIndex(photoIndex === realPhotosLength - 1 ? realPhotosLength - 1 : photoIndex + 1)
      }
    }
  }

  //* Carousel
  const [active, setActive] = useState(defaultPhoto)

  const willActive = (i: number) => {
    // Next image
    if (i === photoIndex + 1 || (photoIndex === realPhotosLength - 1 && i === 0)) return true
    // Previous image
    if (i === photoIndex - 1 || (photoIndex === 0 && i === realPhotosLength - 1)) return true
  }

  useEffect(() => {
    if (!carousel) return
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % petProfileImagesPlaceholder.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [carousel])

  return (
    <div className="absolute inset-0 h-[calc(100%-9rem)] w-full">
      <motion.div
        className="flex h-full touch-none flex-row"
        style={{
          width: `${realPhotosLength * 100}%`,
          x,
        }}
        animate={{
          translateX: `-${(photoIndex * 100) / realPhotosLength}%`,
        }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragTransition={{ bounceDamping: 60, bounceStiffness: 600 }}
        onDragEnd={onDragEnd}
      >
        {photos.map((photo, index) => (
          <div
            className={cn("flex-1", {
              invisible: index !== photoIndex && !willActive(index),
            })}
            key={photo.key}
          >
            <Image
              key={photo.key}
              src={photo.url}
              className="h-full object-cover"
              alt="Pet profile picture"
              width={720}
              height={1480}
            />
          </div>
        ))}
        {/* Add an empty div at the end in order to display the upload photo button */}
        {canAddPhoto && (
          <div
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-2 bg-black/70 text-slate-50 opacity-80",
              "border-none focus:text-primary focus:outline-0 focus:ring-0"
            )}
            role="button"
            tabIndex={0}
            onClick={() => setShowUploadModal(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowUploadModal(true)
            }}
          >
            <ImageUp className={cn("z-10 mx-auto size-16")} />
            <p className="z-10 max-w-48 text-center text-sm">
              {dictionary.petProfilePhotosRequirements.replace("{min}", minPetPhotos.toString())}
            </p>
            <div className="absolute inset-0 bg-black/70" />
            {carousel ? (
              petProfileImagesPlaceholder.map((src, i) => (
                <Image
                  key={`pet-profile-placeholder-${i}`}
                  src={src}
                  className={cn(
                    "absolute inset-0 z-[-1] size-full bg-default-700 object-cover opacity-0 transition-all duration-300",
                    {
                      hidden: i !== active && !willActive(i),
                      "opacity-100": i === active,
                    }
                  )}
                  alt="Pet profile picture"
                  width={720}
                  height={1480}
                />
              ))
            ) : (
              <Image
                src={petProfileImagesPlaceholder[active]}
                className="absolute inset-0 z-[-1] size-full bg-default-700 object-cover"
                alt="Pet profile picture"
                width={720}
                height={1480}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
