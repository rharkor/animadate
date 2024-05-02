"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { upsertPetSchema } from "@/api/pet/schemas"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Chip } from "@nextui-org/react"

import CharacterisitcsSelect from "./characteristics-select"
import EditableText from "./editable-text"
import { PetProfileDr } from "./pet-profile.dr"
import PetProfilePhotos from "./photos"

const formSchema = upsertPetSchema

export default function PetProfile({
  dictionary,
  hasPetProfile,
  defaultPhoto,
}: {
  dictionary: TDictionary<typeof PetProfileDr>
  hasPetProfile: boolean
  defaultPhoto: number
}) {
  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      name: "",
      description: "",
      kind: "dog",
      breed: "",
      characteristics: [],
      photos: [],
    },
  })

  const [age, _setAge] = useState("")
  const setAge = (value: string) => {
    _setAge(value)
    const today = new Date()
    const birthDate = new Date(today.getFullYear() - parseInt(value), today.getMonth(), today.getDate())
    form.setValue("birthdate", birthDate)
    return value
  }

  const handleNameChange = (value: string) => {
    form.setValue("name", value)
    return value
  }

  const handleDescriptionChange = (value: string) => {
    form.setValue("description", value)
    return value
  }

  const handleCharacteristicsChange = (value: string[]) => {
    form.setValue("characteristics", value)
  }

  const onSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    console.log(data)
  }

  const name = form.watch("name")
  const description = form.watch("description")
  const characteristics = form.watch("characteristics")
  const photos = form.watch("photos")

  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  return (
    <section
      className={cn("fixed inset-0 bg-default-600", {
        "z-[60]": !hasPetProfile,
      })}
    >
      <form className="relative flex h-full flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
        <PetProfilePhotos
          defaultPhoto={defaultPhoto}
          photoIndex={photoIndex}
          setPhotoIndex={setPhotoIndex}
          photos={photos}
          setPhotos={(photos) => form.setValue("photos", photos)}
          dictionary={dictionary}
        />
        <div className="z-30 flex justify-between p-2">
          <Chip color="default" variant="flat" className="bg-default-400">
            {photoIndex + 1}/{photos.length + 1}
          </Chip>
          <Button color="primary" type="submit">
            {dictionary.confirm}
          </Button>
        </div>
        <div className="z-30">
          <CharacterisitcsSelect
            dictionary={dictionary}
            characteristics={characteristics}
            setCharacteristics={handleCharacteristicsChange}
          />
          <motion.div
            className={cn("relative flex h-40 flex-col rounded-t-large bg-content1 p-3 pb-5 shadow-medium")}
            animate={{
              height: isDescriptionFocused ? "18rem" : "10rem",
            }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
          >
            <div className="flex w-full flex-row items-center gap-2">
              <EditableText
                className={"min-w-4 text-2xl font-bold"}
                value={name}
                onChange={handleNameChange}
                placeholder={dictionary.petName}
                firstLetterUppercase
              />
              <span className="h-max text-2xl text-muted-foreground">-</span>
              <div className="flex flex-row items-end gap-0.5">
                <EditableText
                  className="min-w-4 text-2xl font-bold text-muted-foreground"
                  value={age}
                  onChange={setAge}
                  placeholder={dictionary.age}
                  type="number"
                  min={0}
                  step={1}
                  max={99}
                  onlyNumbers
                  maxDigits={2}
                />
                <div className="-translate-y-1">{dictionary.yo}</div>
              </div>
            </div>
            <EditableText
              className="flex-1 text-lg"
              value={description}
              onChange={handleDescriptionChange}
              placeholder={dictionary.description}
              multiline
              maxLines={7}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
            />
          </motion.div>
        </div>
      </form>
    </section>
  )
}
