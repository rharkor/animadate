"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue } from "framer-motion"
import { ChevronLeft, ChevronRight, ImageUp, Trash } from "lucide-react"

import { maxPetPhotos } from "@/api/pet/schemas"
import { petProfileImagesPlaceholder } from "@/constants/medias"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Image } from "@nextui-org/react"

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
  setPhotos: (keys: { key: string; url: string }[]) => void
  error: string | null
}

export default function PhotosDisplay({
  photos,
  setPhotos,
  photoIndex,
  setPhotoIndex,
  dictionary,
  setShowUploadModal,
  carousel,
  defaultPhoto,
  error,
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
            className={cn("relative flex-1", {
              invisible: index !== photoIndex && !willActive(index),
            })}
            key={photo.key}
          >
            <PhotoControlPanel
              index={index}
              realPhotosLength={realPhotosLength}
              photos={photos}
              setPhotos={setPhotos}
              setPhotoIndex={setPhotoIndex}
            />
            <Image
              key={photo.key}
              src={photo.url}
              className="h-full rounded-none object-cover"
              classNames={{
                wrapper: "z-0 h-full !max-w-[unset] rounded-none",
              }}
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
              "relative flex flex-1 flex-col items-center justify-center gap-2 bg-black/50 text-slate-50",
              "border-none focus:text-primary focus:outline-0 focus:ring-0"
            )}
            role="button"
            tabIndex={0}
          >
            <Button
              className="z-10"
              startContent={<ImageUp className="size-4" />}
              color="primary"
              onPress={() => setShowUploadModal(true)}
            >
              {dictionary.uploadPhoto}
            </Button>
            {error && <p className="z-10 max-w-48 text-center text-xs text-danger">{error}</p>}
            <div className="absolute inset-0 bg-black/70" />
            {carousel ? (
              petProfileImagesPlaceholder.map((src, i) => (
                <Image
                  key={`pet-profile-placeholder-${i}`}
                  src={src}
                  classNames={{
                    wrapper: cn(
                      "absolute rounded-none !max-w-[unset] inset-0 z-[-1] size-full bg-default-700 opacity-0 transition-all duration-300",
                      {
                        hidden: i !== active && !willActive(i),
                        "opacity-100": i === active,
                      }
                    ),
                  }}
                  className="size-full rounded-none object-cover"
                  alt="Pet profile picture"
                  width={720}
                  height={1480}
                />
              ))
            ) : (
              <Image
                src={petProfileImagesPlaceholder[active]}
                classNames={{
                  wrapper: "absolute rounded-none inset-0 z-[-1] size-full bg-default-700 !max-w-[unset]",
                }}
                className="size-full rounded-none object-cover"
                alt="Pet profile picture"
                width={720}
                height={1480}
              />
            )}
            <PhotoControlPanel
              index={photos.length}
              realPhotosLength={realPhotosLength}
              photos={photos}
              setPhotos={setPhotos}
              setPhotoIndex={setPhotoIndex}
              noButtons
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}

const smallButtonStyle = cn("min-w-0 h-max rounded-full p-1.5")
function PhotoControlPanel({
  index,
  photos,
  setPhotos,
  setPhotoIndex,
  realPhotosLength,
  noButtons,
}: {
  photos: { key: string; url: string }[]
  setPhotos: (keys: { key: string; url: string }[]) => void
  index: number
  setPhotoIndex: (index: number) => void
  realPhotosLength: number
  noButtons?: boolean
}) {
  const handleMove = (direction: "left" | "right") => {
    const currentPhoto = photos[index]
    if (direction === "left") {
      // Move the photo in the array
      //? Swap the current photo with the previous one
      photos[index] = photos[index - 1]
      photos[index - 1] = currentPhoto
      setPhotos(photos)
      // Move the focused photo
      setPhotoIndex(index - 1)
    } else {
      // Move the photo in the array
      //? Swap the current photo with the next one
      photos[index] = photos[index + 1]
      photos[index + 1] = currentPhoto
      setPhotos(photos)
      // Move the focused photo
      setPhotoIndex(index + 1)
    }
  }

  const handleDelete = () => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setPhotoIndex(index === newPhotos.length ? index - 1 : index)
  }

  const handleSlide = (direction: "left" | "right") => {
    if (direction === "left") {
      setPhotoIndex(index === 0 ? 0 : index - 1)
    } else {
      setPhotoIndex(index === realPhotosLength - 1 ? realPhotosLength - 1 : index + 1)
    }
  }

  return (
    <>
      {!noButtons && (
        <div className="absolute left-1/2 top-16 z-20 flex -translate-x-1/2 flex-row gap-1 rounded-full bg-content1 p-1 shadow-medium">
          {index !== 0 && (
            <Button color="primary" onPress={() => handleMove("left")} className={smallButtonStyle}>
              <ChevronLeft className="size-4" />
            </Button>
          )}
          {/* Do not use onPress because the event will propagate */}
          <Button
            color="danger"
            className={smallButtonStyle}
            onClick={handleDelete}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleDelete()
            }}
          >
            <Trash className="size-4" />
          </Button>
          {index !== photos.length - 1 && (
            <Button color="primary" onPress={() => handleMove("right")} className={smallButtonStyle}>
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      )}
      {/* Left invisible section */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1/3"
        aria-label="Slide left"
        role="button"
        tabIndex={0}
        onClick={() => handleSlide("left")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleMove("left")
        }}
      />
      {/* Right invisible section */}
      <div
        className="absolute right-0 top-0 z-10 h-full w-1/3"
        aria-label="Slide right"
        role="button"
        tabIndex={0}
        onClick={() => handleSlide("right")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleMove("right")
        }}
      />
    </>
  )
}
