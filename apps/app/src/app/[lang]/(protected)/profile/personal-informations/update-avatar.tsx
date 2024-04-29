"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Pencil, Trash } from "lucide-react"
import { toast } from "react-toastify"
import { z } from "zod"

import { getAccountResponseSchema } from "@/api/me/schemas"
import FileUpload from "@/components/ui/file-upload"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { maxUploadSize } from "@/constants"
import { useAccount } from "@/hooks/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { getFallbackAvatar, getImageUrl } from "@/lib/utils/client-utils"
import { logger } from "@animadate/lib"
import { Button, Modal, ModalBody, ModalContent, Spinner } from "@nextui-org/react"

import { UpdateAvatarDr } from "./update-avatar.dr"

export default function UpdateAvatar({
  dictionary,
  ssrAccount,
}: {
  dictionary: TDictionary<typeof UpdateAvatarDr>
  ssrAccount: z.infer<ReturnType<typeof getAccountResponseSchema>>
}) {
  const account = useAccount().data ?? ssrAccount
  const fallbackIcon = getFallbackAvatar(account.user.name)

  const utils = trpc.useUtils()

  const getPresignedUrlMutation = trpc.upload.presignedUrl.useMutation()
  const updateUserMutation = trpc.me.updateUser.useMutation()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      toast.error(dictionary.errors.noFileSelected)
      return
    }
    if (file.size > maxUploadSize) {
      toast.error(dictionary.errors.fileTooLarge)
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

        if (uploadResponse.ok) {
          await updateUserMutation.mutateAsync({
            profilePictureKey: fields.key,
          })

          utils.me.getAccount.invalidate()

          setShowModal(false)
        } else {
          const xml = await uploadResponse.text()
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xml, "text/xml")
          const error = xmlDoc.getElementsByTagName("Message")[0]
          if (error.textContent === "Your proposed upload exceeds the maximum allowed size") {
            toast.error(dictionary.errors.fileTooLarge)
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

  const handleDelete = async () => {
    await updateUserMutation.mutateAsync({
      profilePictureKey: null,
    })

    utils.me.getAccount.invalidate()

    setShowModal(false)
  }

  const [showModal, setShowModal] = useState(false)
  const hasProfilePicture = account.user.profilePicture

  return (
    <>
      <div className={cn("group relative mx-auto w-max rounded-full")}>
        <Image
          src={getImageUrl(account.user.profilePicture) ?? fallbackIcon}
          alt="Profile Picture"
          className={cn(
            "size-28 cursor-pointer rounded-full bg-content3 object-cover shadow sm:size-32 sm:shadow-medium"
          )}
          width={128}
          height={128}
          onClick={() => setShowModal(true)}
          priority
        />
        <div
          className={cn("absolute right-0 top-0 space-x-1 transition-all", {
            "-right-4": hasProfilePicture,
          })}
        >
          <Button
            className={cn("h-max min-w-0 rounded-full p-2 shadow")}
            onPress={() => setShowModal(true)}
            color="primary"
          >
            {hasProfilePicture ? <Pencil className="size-4" /> : <Camera className="size-4" />}
          </Button>
          <Button
            color="danger"
            className={cn("h-max min-w-0 rounded-full p-2 shadow", {
              hidden: !hasProfilePicture,
            })}
            onPress={() => handleDelete()}
          >
            {updateUserMutation.isLoading ? (
              <Spinner
                classNames={{
                  wrapper: "!size-4",
                }}
                color="current"
                size="sm"
              />
            ) : (
              <Trash className="size-4" />
            )}
          </Button>
        </div>
      </div>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.updateAvatar}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <FileUpload
                dictionary={dictionary}
                onFilesChange={(files) => {
                  setFile(files[0])
                }}
                maxFiles={1}
                accept={{
                  "image/png": [".png"],
                  "image/jpeg": [".jpg", ".jpeg"],
                }}
                disabled={uploading}
                singleDisplay
                singleDisplayClassName="rounded-full"
              />
              <Button color="primary" type="submit" isDisabled={uploading || !file} isLoading={uploading}>
                {dictionary.updateAvatar}
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
