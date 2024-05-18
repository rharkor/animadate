"use client"

import { useState } from "react"
import { ImageUp } from "lucide-react"
import { toast } from "react-toastify"

import FileUpload from "@/components/ui/file-upload"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { maxUploadSize } from "@/constants"
import { env } from "@/lib/env"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { bytesToUnit } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"
import { logger } from "@animadate/lib"
import { Button, Modal, ModalBody, ModalContent, Spinner } from "@nextui-org/react"

import { PetProfilePhotosDr } from "./photos.dr"
import PhotosDisplay from "./photos-display"

export default function PetProfilePhotos({
  carousel,
  defaultPhoto,
  photos,
  setPhotos,
  dictionary,
  error,
  isDescriptionFocused,
  isReadOnly,
  setPhotoIndex,
}: {
  carousel?: boolean
  defaultPhoto?: number
  photos: { key: string; url: string; order: number | null }[]
  setPhotos?: (keys: { key: string; url: string; order: number | null }[]) => void
  dictionary: TDictionary<typeof PetProfilePhotosDr>
  error?: string | null
  isDescriptionFocused?: boolean
  isReadOnly?: boolean
  setPhotoIndex?: (index: number) => void
}) {
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
          setPhotos?.([...photos, { key: fields.key, url: imageUrl, order: photos.length }])
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
        <PhotosDisplay
          photos={photos}
          setPhotos={setPhotos}
          dictionary={dictionary}
          setShowUploadModal={setShowUploadModal}
          defaultPhoto={defaultPhoto}
          carousel={carousel}
          error={error}
          isDescriptionFocused={isDescriptionFocused}
          isReadOnly={isReadOnly}
          setPhotoIndex={setPhotoIndex}
        />
      </div>
      {!isReadOnly && (
        <Modal
          isOpen={showUploadModal}
          onOpenChange={(open) => {
            setShowUploadModal(open)
            if (!open) setCurrentFile(null)
          }}
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
                singleDisplayClassName="w-[140px] h-[250px]"
                imageCropProps={{
                  classNames: {
                    wrapper: "z-[71]",
                    backdrop: "z-[70]",
                  },
                }}
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
      )}
    </div>
  )
}
