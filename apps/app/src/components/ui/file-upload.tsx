"use client"

import { InputHTMLAttributes, useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Crop, Trash, Upload } from "lucide-react"
import { Accept, useDropzone } from "react-dropzone"

import { TDictionary } from "@/lib/langs"
import { bytesToUnit, cn } from "@/lib/utils"
import { Button, useDisclosure } from "@nextui-org/react"

import { FileUploadDr } from "./file-upload.dr"
import ImageCrop from "./image-crop"

function File({
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
            onPress={() => onCroppingOpen(i)}
          >
            <Crop className="size-4" />
          </Button>
          <Button color="danger" className="h-[unset] min-w-0 shrink-0 rounded-full p-1" onPress={() => removeFile(i)}>
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
  ...props
}: TFileUploadProps) {
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept,
    maxFiles,
  })
  const [files, setFiles] = useState<File[]>([])
  const [croppedFiles, setCroppedFiles] = useState<File[]>([])
  useEffect(() => {
    if (!acceptedFiles.length) return
    onFilesChange?.(acceptedFiles)
    setFiles(acceptedFiles)
    setCroppedFiles(acceptedFiles)
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

  return (
    <>
      <div className="flex flex-col gap-2">
        {singleDisplay && croppedFiles.length > 0 && firstFileUrl ? (
          <div className={cn("group relative mx-auto w-max")}>
            <Image
              src={firstFileUrl}
              alt="Uploaded file"
              className={cn("!size-32 bg-content3 object-cover shadow sm:shadow-medium", singleDisplayClassName)}
              width={128}
              height={128}
            />
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "flex h-[250px] cursor-pointer flex-col items-center justify-center gap-4 rounded-medium border border-dashed border-transparent bg-muted/20 p-2 px-6 text-foreground transition-all",
              {
                "hover:border-primary hover:bg-muted/40 focus:border-primary focus:bg-muted/40": !disabled,
                "border-primary bg-muted/50": isDragAccept,
                "border-danger bg-danger/40": isDragReject,
              },
              className
            )}
          >
            <input type="file" {...getInputProps()} disabled={disabled} {...props} />
            <Upload className="size-12" />
            <p className="text-center text-sm text-foreground/80">{dictionary.uploadDescription}</p>
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {croppedFiles.map((file, i) => (
            <File file={file} i={i} removeFile={removeFile} key={i} onCroppingOpen={onCroppingOpen} />
          ))}
        </ul>
      </div>
      <ImageCrop
        originalFile={files[croppingIndex]}
        setFile={setFileCrop}
        onOpenChange={onCroppingOpenChange}
        isOpen={isCroppingOpen}
        dictionary={dictionary}
      />
    </>
  )
}
