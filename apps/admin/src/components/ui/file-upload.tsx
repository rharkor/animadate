"use client"

import { InputHTMLAttributes, useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Camera, Crop, Images, Trash, Upload } from "lucide-react"
import { Accept, useDropzone } from "react-dropzone"
import { toast } from "react-toastify"

import useCamera from "@/hooks/use-camera/use-camera"
import { TDictionary } from "@/lib/langs"
import { bytesToUnit, cn } from "@/lib/utils"
import { Button, Divider, useDisclosure } from "@nextui-org/react"

import { FileUploadDr } from "./file-upload.dr"
import ImageCrop from "./image-crop"

function FileDisplay({
  file,
  i,
  removeFile,
  onCroppingOpen,
}: {
  file: File
  i: number
  removeFile: (index: number) => void
  onCroppingOpen: (index: number) => void
}) {
  return (
    <li className="flex flex-col gap-2" key={i}>
      <div className="flex flex-row items-center justify-between gap-1 rounded-medium border border-muted-foreground/30 p-1 pl-3">
        <p className="flex flex-row overflow-hidden">
          <span className="block truncate">{file.name}</span>
          <span className="ml-1 block text-muted-foreground">
            (
            {file.size < 1024
              ? `${file.size}o`
              : file.size < 1024 * 1024
                ? `${bytesToUnit(file.size, "kilobytes", true)}Ko`
                : `${bytesToUnit(file.size, "megabytes", true)}Mo`}
            )
          </span>
        </p>
        <div className="flex gap-1">
          <Button
            color="primary"
            className="h-[unset] min-w-0 shrink-0 rounded-full p-1"
            onClick={() => onCroppingOpen(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onCroppingOpen(i)
              }
            }}
          >
            <Crop className="size-4" />
          </Button>
          <Button
            color="danger"
            className="h-[unset] min-w-0 shrink-0 rounded-full p-1"
            onClick={() => removeFile(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                removeFile(i)
              }
            }}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export type TFileUploadProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onFilesChange" | "dictionary" | "disabled" | "accept" | "dictionary" | "singleDisplay"
> & {
  className?: string
  onFilesChange?: (files: File[]) => void
  disabled?: boolean
  accept?: Accept //? See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  maxFiles?: number
  dictionary: TDictionary<typeof FileUploadDr>
  singleDisplay?: boolean
  singleDisplayClassName?: string
  imageCropProps?: Omit<
    Parameters<typeof ImageCrop>[0],
    "originalFile" | "setFile" | "onOpenChange" | "isOpen" | "dictionary"
  >
  customCamera?: boolean
}

export default function FileUpload({
  className,
  onFilesChange,
  disabled,
  accept,
  maxFiles,
  dictionary,
  singleDisplay,
  singleDisplayClassName,
  imageCropProps,
  customCamera,
  ...props
}: TFileUploadProps) {
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject, open } = useDropzone({
    accept,
    maxFiles,
    multiple: maxFiles !== 1,
    onDropRejected(fileRejections) {
      const fileRejection = fileRejections[0]
      if (fileRejection.errors[0].code === "file-invalid-type") {
        toast.error(dictionary.invalidFileType)
      }
    },
  })

  const {
    takePhoto,
    onClose: takePhotoOnClose,
    showModal: takePhotoShowModal,
    content: cameraContent,
  } = useCamera({
    dictionary,
  })

  const [files, setFiles] = useState<File[]>([])
  const [croppedFiles, setCroppedFiles] = useState<File[]>([])

  useEffect(() => {
    if (!acceptedFiles.length) return
    onFilesChange?.(acceptedFiles)
    setFiles(acceptedFiles)
    setCroppedFiles(acceptedFiles)
    if (takePhotoShowModal) takePhotoOnClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles])

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onFilesChange?.(newFiles)
    setFiles(newFiles)
    setCroppedFiles(newFiles)
  }

  const handleCrop = useCallback(
    async (index: number, file: File) => {
      const newFiles = [...files]
      newFiles.splice(index, 1, file)
      onFilesChange?.(newFiles)
      setCroppedFiles(newFiles)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  )

  const firstFileUrl = useMemo(() => {
    if (!croppedFiles.length) return null
    return URL.createObjectURL(croppedFiles[0])
  }, [croppedFiles])

  const { isOpen: isCroppingOpen, onOpen: _onCroppingOpen, onOpenChange: onCroppingOpenChange } = useDisclosure()
  const [croppingIndex, setCroppingIndex] = useState<number>(0)
  const setFileCrop = useCallback(
    (file: File) => {
      handleCrop(croppingIndex, file)
    },
    [handleCrop, croppingIndex]
  )
  const onCroppingOpen = useCallback(
    (index: number) => {
      setCroppingIndex(index)
      _onCroppingOpen()
    },
    [_onCroppingOpen]
  )

  const handleTakePhoto = useCallback(async () => {
    const file = await takePhoto({
      openGalery: open,
    })
    onFilesChange?.([file])
    setFiles([file])
    setCroppedFiles([file])
  }, [onFilesChange, takePhoto, open])

  const inputProps = getInputProps()

  return (
    <>
      <div className="flex flex-col gap-2">
        {singleDisplay && croppedFiles.length > 0 && firstFileUrl ? (
          <div className={cn("group relative mx-auto w-max")}>
            <Image
              src={firstFileUrl}
              alt="Uploaded file"
              className={cn("size-32 bg-content3 object-cover shadow sm:shadow-medium", singleDisplayClassName)}
              width={128}
              height={128}
            />
          </div>
        ) : (
          <>
            {customCamera && (
              <>
                <Button
                  color="primary"
                  className="w-full"
                  onPress={handleTakePhoto}
                  startContent={<Camera className="size-4" />}
                >
                  {dictionary.takePhoto}
                </Button>
                <div className="flex w-full flex-row items-center gap-2">
                  <Divider className="w-[unset] flex-1" />
                  <p>{dictionary.or}</p>
                  <Divider className="w-[unset] flex-1" />
                </div>
              </>
            )}
            <Button className="w-full sm:hidden" onPress={open} startContent={<Images className="size-4" />}>
              {dictionary.selectPhoto}
            </Button>
            <div
              {...getRootProps()}
              className={cn(
                "flex h-[250px] cursor-pointer flex-col items-center justify-center gap-4 rounded-medium border border-dashed border-transparent bg-muted/20 p-2 px-6 text-foreground transition-all",
                "max-sm:hidden",
                {
                  "hover:border-primary hover:bg-muted/40 focus:border-primary focus:bg-muted/40": !disabled,
                  "border-primary bg-muted/50": isDragAccept,
                  "border-danger bg-danger/40": isDragReject,
                },
                className
              )}
            >
              <input
                type="file"
                {...inputProps}
                accept={inputProps.accept + ";capture=camera"}
                disabled={disabled}
                {...props}
              />
              <Upload className="size-12" />
              <p className="text-center text-sm text-foreground/80">{dictionary.uploadDescription}</p>
            </div>
          </>
        )}
        <ul className="flex flex-col gap-2">
          {croppedFiles.map((file, i) => (
            <FileDisplay file={file} i={i} removeFile={removeFile} key={i} onCroppingOpen={onCroppingOpen} />
          ))}
        </ul>
      </div>
      <ImageCrop
        originalFile={files[croppingIndex]}
        setFile={setFileCrop}
        onOpenChange={onCroppingOpenChange}
        isOpen={isCroppingOpen}
        dictionary={dictionary}
        {...imageCropProps}
      />
      {cameraContent}
    </>
  )
}
