"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ImageUp } from "lucide-react"
import { toast } from "react-toastify"

import { maxPetPhotos, minPetPhotos } from "@/api/pet/schemas"
import FileUpload from "@/components/ui/file-upload"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { maxUploadSize } from "@/constants"
import { petProfileImagesPlaceholder } from "@/constants/medias"
import { env } from "@/lib/env"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { bytesToUnit, cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"
import { logger } from "@animadate/lib"
import { Button, Modal, ModalBody, ModalContent, Spinner } from "@nextui-org/react"

import { PetProfilePhotosDr } from "./photos.dr"

export default function PetProfilePhotos({
  carousel,
  defaultPhoto,
  photoIndex,
  setPhotoIndex,
  photos,
  setPhotos,
  dictionary,
}: {
  carousel?: boolean
  defaultPhoto: number
  photoIndex: number
  setPhotoIndex: (index: number) => void
  photos: { key: string; url: string }[]
  setPhotos: (keys: { key: string; url: string }[]) => void
  dictionary: TDictionary<typeof PetProfilePhotosDr>
}) {
  //* Carousel
  const [active, setActive] = useState(defaultPhoto)

  const willActive = (i: number) => {
    // Next image
    if (i === active + 1 || (active === petProfileImagesPlaceholder.length - 1 && i === 0)) return true
    // Previous image
    if (i === active - 1 || (active === 0 && i === petProfileImagesPlaceholder.length - 1)) return true
  }

  useEffect(() => {
    if (!carousel) return
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % petProfileImagesPlaceholder.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [carousel])

  //* Upload
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const getPresignedUrlMutation = trpc.upload.presignedUrl.useMutation()

  const addFile = async (file: File) => {
    if (file.size > maxUploadSize) {
      toast.error(
        dictionary.errors.fileTooLarge.replace("{max}", bytesToUnit(maxUploadSize, "megabytes").toString() + "Mo")
      )
      return
    }
    setUploading(true)
    try {
      const { url, fields } = await getPresignedUrlMutation.mutateAsync({
        filename: file.name,
        filetype: file.type,
      })

      try {
        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append("file", file)

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        })

        const key = fields.key

        const imageUrl =
          getImageUrl({
            key,
            bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME ?? "",
            endpoint: env.NEXT_PUBLIC_S3_ENDPOINT ?? "",
            filetype: file.type,
          }) ?? ""

        if (uploadResponse.ok) {
          setPhotos([...photos, { key: fields.key, url: imageUrl }])
          setCurrentFile(null)
          setShowUploadModal(false)
        } else {
          const xml = await uploadResponse.text()
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xml, "text/xml")
          const error = xmlDoc.getElementsByTagName("Message")[0]
          if (error.textContent === "Your proposed upload exceeds the maximum allowed size") {
            toast.error(
              dictionary.errors.fileTooLarge.replace("{max}", bytesToUnit(maxUploadSize, "megabytes").toString() + "Mo")
            )
          } else {
            toast.error(dictionary.unknownError)
          }
        }
      } catch (e) {
        logger.error(e)
        toast.error(dictionary.unknownError)
      }
    } catch {
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="absolute inset-0">
      <div className="relative size-full">
        {photos.length > 0 ? (
          photos.map(({ url, key }) => (
            <Image
              key={key}
              src={url}
              className="absolute inset-0 h-[calc(100%-9rem)] w-full object-cover"
              alt="Pet profile picture"
              width={720}
              height={1480}
            />
          ))
        ) : (
          <>
            <div className="absolute inset-0 z-10 bg-black/70" />
            {carousel ? (
              petProfileImagesPlaceholder.map((src, i) => (
                <Image
                  key={`pet-profile-placeholder-${i}`}
                  src={src}
                  className={cn(
                    "absolute inset-0 h-[calc(100%-9rem)] w-full object-cover opacity-0 transition-all duration-300",
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
                className="absolute inset-0 h-[calc(100%-9rem)] w-full object-cover"
                alt="Pet profile picture"
                width={720}
                height={1480}
              />
            )}
          </>
        )}
        <div
          className={cn(
            "absolute inset-0 z-20 flex flex-col items-center justify-center space-y-2 text-slate-50 opacity-80",
            "border-none focus:text-primary focus:outline-0 focus:ring-0",
            {
              hidden: photoIndex === photos.length - 1 && photoIndex !== maxPetPhotos - 1,
            }
          )}
          role="button"
          tabIndex={0}
          onClick={() => setShowUploadModal(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setShowUploadModal(true)
          }}
        >
          <ImageUp className={cn("mx-auto size-16")} />
          <p className="max-w-48 text-center text-sm">
            {dictionary.petProfilePhotosRequirements.replace("{min}", minPetPhotos.toString())}
          </p>
        </div>
      </div>
      <Modal
        isOpen={showUploadModal}
        onOpenChange={(open) => setShowUploadModal(open)}
        classNames={{
          wrapper: "z-[71]",
          backdrop: "z-[70]",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.uploadPhoto}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <FileUpload
              dictionary={dictionary}
              onFilesChange={(files) => {
                const file = files[0]
                setCurrentFile(file)
              }}
              maxFiles={1}
              accept={{
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
              }}
              disabled={uploading}
              singleDisplay
              imageCropProps={{
                classNames: {
                  wrapper: "z-[71]",
                  backdrop: "z-[70]",
                },
              }}
              canTakePhoto
            />
            {currentFile && (
              <Button
                color="primary"
                type="button"
                onPress={() => {
                  addFile(currentFile)
                }}
                isDisabled={uploading}
                startContent={
                  uploading ? (
                    <Spinner classNames={{ wrapper: "size-4" }} color="current" size="sm" />
                  ) : (
                    <ImageUp className="size-4" />
                  )
                }
              >
                {dictionary.upload}
              </Button>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}
