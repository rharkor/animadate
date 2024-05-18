"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, useMotionValue } from "framer-motion"
import { ChevronLeft, ChevronRight, ImageUp, Trash } from "lucide-react"

import { maxPetPhotos } from "@/api/pet/schemas"
import { petProfileImagesPlaceholder } from "@/constants/medias"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

import { PhotosDisplayDr } from "./photos-display.dr"

interface Photo {
  key: string
  url: string
  order: number | null
}

interface PhotosDisplayProps {
  photos: Photo[]
  dictionary: TDictionary<typeof PhotosDisplayDr>
  setShowUploadModal: (show: boolean) => void
  carousel?: boolean
  defaultPhoto?: number
  setPhotos?: (keys: { key: string; url: string; order: number | null }[]) => void
  error?: string | null
  isDescriptionFocused?: boolean
  isReadOnly?: boolean
  setPhotoIndex?: (index: number) => void
}

export default function PhotosDisplay({
  photos,
  setPhotos,
  dictionary,
  setShowUploadModal,
  carousel,
  defaultPhoto,
  error,
  isDescriptionFocused: _isDescriptionFocused,
  isReadOnly,
  setPhotoIndex: propsSetPhotoIndex,
}: PhotosDisplayProps) {
  const [photoIndex, _setPhotoIndex] = useState(0)
  const setPhotoIndex = (index: number) => {
    if (index < 0) return
    _setPhotoIndex(index)
    propsSetPhotoIndex?.(index)
  }

  useEffect(() => {
    if (!error) return
    // Scroll to the end of the container
    setPhotoIndex(photos.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  //* Swipe
  const x = useMotionValue(0)

  const canAddPhoto = !isReadOnly && photos.length < maxPetPhotos
  const realPhotosLength = canAddPhoto ? photos.length + 1 : photos.length

  // Minimum distance (in pixels) to trigger swipe
  const minSwipeDistance = 70

  const [invalidSwipe, setInvalidSwipe] = useState(false)
  const onDragEnd = (_: MouseEvent | TouchEvent, info: { offset: { x: number } }) => {
    const distance = Math.abs(info.offset.x)
    if (distance > minSwipeDistance) {
      setInvalidSwipe(false)
      setTimeout(() => setInvalidSwipe(false), 300)
      if (info.offset.x > 0) {
        // Swipe right
        setPhotoIndex(photoIndex === 0 ? 0 : photoIndex - 1)
      } else {
        // Swipe left
        setPhotoIndex(photoIndex === realPhotosLength - 1 ? realPhotosLength - 1 : photoIndex + 1)
      }
    } else {
      setInvalidSwipe(true)
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
      setActive((prev) => ((prev ?? 0) + 1) % petProfileImagesPlaceholder.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [carousel])

  //* Description not focused
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (!_isDescriptionFocused) {
      timeout = setTimeout(() => {
        setIsDescriptionFocused(false)
      }, 200)
    } else {
      setIsDescriptionFocused(true)
    }
    return () => clearTimeout(timeout)
  }, [_isDescriptionFocused])

  //* Slide
  const handleSlide = (direction: "left" | "right") => {
    if (direction === "left") {
      setPhotoIndex(photoIndex === 0 ? 0 : photoIndex - 1)
    } else {
      setPhotoIndex(photoIndex === realPhotosLength - 1 ? realPhotosLength - 1 : photoIndex + 1)
    }
  }

  const dragContainer = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute inset-0 h-[calc(100%-9rem)] w-full" ref={dragContainer}>
      <motion.div
        className={cn("relative z-10 flex h-full touch-none flex-row")}
        style={{
          width: `${realPhotosLength * 100}%`,
          x,
        }}
        {...(isReadOnly
          ? {}
          : {
              drag: "x",
              dragConstraints: { left: 0, right: 0 },
              dragTransition: { bounceDamping: 60, bounceStiffness: 600 },
              onDragEnd,
            })}
      >
        <div
          style={{
            transform: `translateX(-${(photoIndex * 100) / realPhotosLength}%)`,
          }}
          className="flex size-full touch-none flex-row transition-all duration-300"
        >
          {photos.map((photo, index) => (
            <div
              className={cn("relative flex-1", {
                invisible: index !== photoIndex && !willActive(index),
              })}
              key={photo.key}
            >
              {!isReadOnly && (
                <PhotoControlPanel index={index} photos={photos} setPhotos={setPhotos} setPhotoIndex={setPhotoIndex} />
              )}
              <Image
                key={photo.key}
                src={photo.url}
                className="size-full !max-w-[unset] rounded-none object-cover max-lg:w-screen"
                alt="Pet profile picture"
                width={720}
                height={1480}
              />
              <SwitchPhoto
                handleSlide={handleSlide}
                isDescriptionFocused={isDescriptionFocused}
                isReadOnly={isReadOnly}
              />
            </div>
          ))}
          {/* Add an empty div at the end in order to display the upload photo button */}
          {canAddPhoto && active !== undefined && (
            <div
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-2 bg-black/50 text-slate-50",
                "border-none focus:text-primary focus:outline-0 focus:ring-0"
              )}
              role="button"
              tabIndex={0}
            >
              <Button
                className="z-20"
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
                    className={cn(
                      "absolute inset-0 z-[-1] size-full !max-w-[unset] bg-default-700 object-cover opacity-0 transition-all duration-300 max-lg:w-screen",
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
                  className="absolute inset-0 z-[-1] size-full !max-w-[unset] bg-default-700 object-cover max-lg:w-screen"
                  alt="Pet profile picture"
                  width={720}
                  height={1480}
                />
              )}
              <SwitchPhoto
                handleSlide={handleSlide}
                isDescriptionFocused={isDescriptionFocused}
                isReadOnly={isReadOnly}
              />
            </div>
          )}
        </div>
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
}: {
  photos: { key: string; url: string; order: number | null }[]
  setPhotos?: (keys: { key: string; url: string; order: number | null }[]) => void
  index: number
  setPhotoIndex: (index: number) => void
}) {
  const handleMove = (direction: "left" | "right") => {
    const currentPhoto = photos[index]
    if (direction === "left") {
      // Move the photo in the array
      //? Swap the current photo with the previous one
      photos[index] = photos[index - 1]
      photos[index - 1] = currentPhoto
      setPhotos?.(photos)
      // Move the focused photo
      setPhotoIndex(index - 1)
    } else {
      // Move the photo in the array
      //? Swap the current photo with the next one
      photos[index] = photos[index + 1]
      photos[index + 1] = currentPhoto
      setPhotos?.(photos)
      // Move the focused photo
      setPhotoIndex(index + 1)
    }
  }

  const handleDelete = () => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos?.(newPhotos)
    setPhotoIndex(index === newPhotos.length ? index - 1 : index)
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 top-16 z-20 flex -translate-x-1/2 flex-row gap-1 rounded-full bg-content1 p-1 shadow-medium"
      )}
    >
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
  )
}

function SwitchPhoto({
  handleSlide,
  isDescriptionFocused,
  isReadOnly,
}: {
  handleSlide: (direction: "left" | "right") => void
  isDescriptionFocused: boolean
  isReadOnly?: boolean
}) {
  return (
    <>
      {/* Left invisible section */}
      <div
        className={cn("absolute left-0 top-0 h-full w-1/2", {
          "w-1/3": isReadOnly,
        })}
        aria-label="Slide left"
        role="button"
        tabIndex={0}
        onClick={() => !isDescriptionFocused && handleSlide("left")}
        onKeyDown={(e) => {
          if (!isDescriptionFocused && (e.key === "Enter" || e.key === " ")) handleSlide("left")
        }}
      />
      {/* Right invisible section */}
      <div
        className={cn("absolute right-0 top-0 h-full w-1/2", {
          "w-1/3": isReadOnly,
        })}
        aria-label="Slide right"
        role="button"
        tabIndex={0}
        onClick={() => !isDescriptionFocused && handleSlide("right")}
        onKeyDown={(e) => {
          if (!isDescriptionFocused && (e.key === "Enter" || e.key === " ")) handleSlide("right")
        }}
      />
    </>
  )
}
