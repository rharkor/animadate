"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { SubmitErrorHandler, useForm } from "react-hook-form"
import { z } from "zod"

import { getPetProfileResponseSchema, maxDescriptionLines, maxPetPhotos, upsertPetSchema } from "@/api/pet/schemas"
import SmartPhoneDeviceLook from "@/components/ui/device-look/smart-phone"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Chip } from "@nextui-org/react"

import { containerClassName } from "../utils"

import ChipsContainer from "./chips-container"
import DesktopForm from "./desktop-form"
import EditableText from "./editable-text"
import { PetProfileDr } from "./pet-profile.dr"
import PetProfilePhotos from "./photos"
import { preprocessValue } from "./utils"

const formSchema = upsertPetSchema

export default function PetProfile({
  dictionary,
  hasPetProfile,
  defaultPhoto,
  backButton,
  ssrPetProfile,
}: {
  dictionary: TDictionary<typeof PetProfileDr>
  hasPetProfile: boolean
  defaultPhoto: number
  backButton: React.ReactNode
  ssrPetProfile?: z.infer<ReturnType<typeof getPetProfileResponseSchema>>
}) {
  const utils = trpc.useUtils()
  const sp = useSearchParams()
  const router = useRouter()

  const petProfile = hasPetProfile ? trpc.pet.getPetProfile.useQuery({}).data ?? ssrPetProfile ?? null : null

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(dictionary)),
    values: {
      id: petProfile?.id ?? undefined,
      name: petProfile?.name ?? "",
      description: petProfile?.description ?? "",
      kind: (petProfile?.kind as "DOG" | undefined) ?? "DOG",
      breed: petProfile?.breed ?? "",
      characteristics: petProfile?.characteristics.map((c) => c.value) ?? [],
      photos:
        petProfile?.photos.map((p) => ({
          key: p.key,
          order: p.order,
          url: getImageUrl(p) ?? "",
        })) ?? [],
      birthdate: petProfile?.birthdate.toISOString() ?? "",
    },
  })

  const name = form.watch("name")
  const description = form.watch("description")
  const characteristics = form.watch("characteristics")
  const photos = form.watch("photos")
  const breed = form.watch("breed")
  const birthdate = form.watch("birthdate")

  const setAge = (value: string) => {
    value = preprocessValue(value, ageFormatted, { onlyNumbers: true, maxDigits: 2 })
    const age = parseInt(value)
    if (isNaN(age)) {
      form.setValue("birthdate", "")
    } else {
      const today = new Date()
      const birthDate = new Date(Date.UTC(today.getFullYear() - age, 0, 1))
      form.setValue("birthdate", birthDate.toISOString())
    }
    return value
  }

  const getAge = (birthdate: string) => {
    const today = new Date()
    const birthDate = new Date(birthdate)
    if (isNaN(birthDate.getTime())) return 0
    return today.getFullYear() - birthDate.getFullYear()
  }

  const handleNameChange = (value: string) => {
    value = preprocessValue(value, name, { firstLetterUppercase: true })
    form.setValue("name", value)
    return value
  }

  const handleDescriptionChange = (value: string) => {
    value = preprocessValue(value, description, { multiline: true, maxLines: maxDescriptionLines })
    form.setValue("description", value)
    return value
  }

  const handleCharacteristicsChange = (value: string[]) => {
    form.setValue("characteristics", value)
    return value
  }

  const handleBreedChange = (value: string) => {
    form.setValue("breed", value)
    return value
  }

  const handleSetPhotos = (photos: z.infer<ReturnType<typeof formSchema>>["photos"]) => {
    form.setValue(
      "photos",
      photos.map((p, i) => ({ key: p.key, url: p.url, order: i }))
    )
    return photos
  }

  const upsertPetMutation = trpc.pet.upsertPet.useMutation()
  const onSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    await upsertPetMutation.mutateAsync(data)
    utils.me.getAccount.invalidate()
    utils.pet.invalidate()

    const onSuccessSp = sp.get("onSuccess")
    if (onSuccessSp) {
      router.push(onSuccessSp)
    } else {
      router.push("/profile")
    }
  }

  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
  const [photoIndex, _setPhotoIndex] = useState(0)
  const setPhotoIndex = (index: number) => {
    if (index < 0) return
    _setPhotoIndex(index)
  }

  const photosError = form.formState.errors.photos?.message ?? null
  const nameError = form.formState.errors.name?.message ?? null
  const ageError = form.formState.errors.birthdate?.message ?? null
  const descriptionError = form.formState.errors.description?.message ?? null
  const breedError = form.formState.errors.breed?.message ?? null
  const characteristicsError = form.formState.errors.characteristics?.message ?? null

  // Auto recheck all errors when the form is submitted
  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isSubmitted) form.trigger()
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, form.trigger, form.formState.isSubmitted])

  const chipsContainer = useRef<HTMLDivElement>(null)
  const onInvalid: SubmitErrorHandler<z.infer<ReturnType<typeof formSchema>>> = (errors) => {
    if (errors.breed || errors.characteristics) {
      // Scroll to the end of the container
      chipsContainer.current?.scrollTo({
        left: chipsContainer.current.scrollWidth,
        behavior: "smooth",
      })
    }

    if (errors.photos) {
      // Scroll to the end of the container
      setPhotoIndex(photos.length)
    }
  }

  const age = getAge(birthdate)
  const ageFormatted = age > 0 ? age.toString() : ""

  return (
    <section className={cn(containerClassName, "fixed inset-0 z-[60] bg-black sm:max-w-screen-lg", "lg:bg-background")}>
      <form className={cn("flex h-full gap-2")} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <DesktopForm
          dictionary={dictionary}
          hasPetProfile={hasPetProfile}
          petName={name}
          onPetNameChange={handleNameChange}
          petAge={ageFormatted}
          onPetAgeChange={setAge}
          description={description}
          onDescriptionChange={handleDescriptionChange}
          breed={breed}
          onBreedChange={handleBreedChange}
          characteristics={characteristics}
          onCharacteristicsChange={handleCharacteristicsChange}
          breedError={breedError}
          isLoading={upsertPetMutation.isPending}
          ageError={ageError}
          characteristicsError={characteristicsError}
          descriptionError={descriptionError}
          nameError={nameError}
        />
        <section className={cn("max-lg:w-full lg:p-3")}>
          <h2
            className={cn("text-xl font-medium uppercase text-muted-foreground max-lg:hidden", {
              "mt-11": hasPetProfile,
            })}
          >
            {dictionary.preview}
          </h2>
          <div className="max-lg:h-full lg:mt-5">
            <SmartPhoneDeviceLook
              classNames={{
                wrapper: "max-lg:rounded-[unset] max-lg:p-0 max-lg:bg-[unset] h-full",
                container: "max-lg:overflow-[unset] max-lg:rounded-[unset] h-full",
                plusButton: "max-lg:hidden",
                minusButton: "max-lg:hidden",
                powerButton: "max-lg:hidden",
              }}
            >
              <div
                className={cn(
                  "relative flex size-full flex-col justify-between overflow-hidden",
                  "lg:h-[740px] lg:w-[360px]"
                )}
              >
                <PetProfilePhotos
                  defaultPhoto={defaultPhoto}
                  photoIndex={photoIndex}
                  setPhotoIndex={setPhotoIndex}
                  photos={photos}
                  setPhotos={handleSetPhotos}
                  dictionary={dictionary}
                  error={photosError}
                  isDescriptionFocused={isDescriptionFocused}
                />
                <div className="z-30 flex justify-between p-2">
                  <div className="flex flex-col gap-2">
                    {backButton}
                    <Chip color="default" variant="faded" className="bg-default-400">
                      {photoIndex + 1}/{Math.min(photos.length + 1, maxPetPhotos)}
                    </Chip>
                  </div>
                  <Button
                    color="success"
                    type="submit"
                    isLoading={upsertPetMutation.isPending}
                    size={hasPetProfile ? "sm" : "md"}
                    className="lg:hidden"
                  >
                    {dictionary.save}
                  </Button>
                </div>
                <div className="relative z-30">
                  <div className="absolute inset-0 z-[-1] translate-y-[-30px] bg-gradient-to-b from-black/0 to-black/70 to-20%" />
                  <ChipsContainer
                    dictionary={dictionary}
                    breedError={breedError}
                    characteristicsError={characteristicsError}
                    handleBreedChange={handleBreedChange}
                    handleCharacteristicsChange={handleCharacteristicsChange}
                    breed={breed}
                    characteristics={characteristics}
                    chipsContainer={chipsContainer}
                  />
                  <motion.div
                    className={cn("relative flex h-52 flex-col rounded-t-large bg-content1 p-3 shadow-medium")}
                    animate={{
                      height: isDescriptionFocused ? "18rem" : "13rem",
                    }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
                  >
                    <div className="flex w-full flex-row gap-2">
                      <div className="flex flex-col">
                        <EditableText
                          className={"min-w-4 shrink-0 text-2xl font-bold"}
                          value={name}
                          onChange={handleNameChange}
                          placeholder={dictionary.petName}
                          classNames={{
                            paragraph: "truncate",
                          }}
                        />
                        {nameError && <p className="text-xs text-danger lg:hidden">{nameError}</p>}
                      </div>
                      <div className="flex h-[44px] items-center">
                        <span className="text-2xl text-muted-foreground">-</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex flex-row items-end gap-0.5">
                          <EditableText
                            className="min-w-4 shrink-0 text-2xl font-bold text-muted-foreground"
                            value={ageFormatted}
                            onChange={setAge}
                            placeholder={dictionary.age}
                            classNames={{
                              paragraph: "truncate",
                            }}
                            type="number"
                            min={0}
                            step={1}
                            max={99}
                          />
                          <div className="-translate-y-1 py-1">{age > 1 ? dictionary.yos : dictionary.yo}</div>
                        </div>
                        {ageError && <p className="text-xs text-danger lg:hidden">{ageError}</p>}
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col">
                      <EditableText
                        className="min-h-0 flex-1"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder={dictionary.description}
                        onFocus={() => setIsDescriptionFocused(true)}
                        onBlur={() => setIsDescriptionFocused(false)}
                        classNames={{
                          input: "overflow-auto",
                        }}
                      />
                      {descriptionError && <p className="text-xs text-danger lg:hidden">{descriptionError}</p>}
                    </div>
                  </motion.div>
                </div>
              </div>
            </SmartPhoneDeviceLook>
          </div>
        </section>
      </form>
    </section>
  )
}
