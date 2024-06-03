"use client"

import { useRef, useState } from "react"
import { DragHandlers, motion, useMotionValue, useTransform } from "framer-motion"
import { MapPin } from "lucide-react"
import { z } from "zod"

import { getSuggestedPetsResponseSchema } from "@/api/match/schemas"
import ChipsContainer from "@/components/pet/chips-container"
import PetProfilePhotos from "@/components/pet/photos"
import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"

import { useMatch } from "./match-context"
import { MatchProfileDr } from "./match-profile.dr"

const getAge = (birthdate: Date) => {
  const today = new Date()
  if (isNaN(birthdate.getTime())) return 0
  return today.getFullYear() - birthdate.getFullYear()
}

export default function MatchProfile({
  dictionary,
  suggested,
  style,
  isCurrent,
}: {
  dictionary: TDictionary<typeof MatchProfileDr>
  suggested: z.infer<ReturnType<typeof getSuggestedPetsResponseSchema>>["pets"][number]
  style?: React.CSSProperties
  isCurrent: boolean
}) {
  const { animate, dismiss, like, currentPet, transitionDuration, canSlide } = useMatch()

  const chipsContainer = useRef<HTMLDivElement>(null)

  const age = getAge(suggested.birthdate)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-350, 0, 350], [-20, 0, 20])
  const scale = useTransform(x, [-350, 0, 350], [1.1, 1, 1.1])
  const opacity = useTransform(x, [-350, -150, 0, 150, 350], [0, 1, 1, 1, 0])

  const [hasBeenDragged, setHasBeenDragged] = useState(false)

  // Minimum distance (in pixels) to trigger swipe
  const minSwipeDistance = 100
  const onDragEnd: DragHandlers["onDragEnd"] = async (_, info) => {
    setTimeout(() => {
      setHasBeenDragged(false)
    }, 100)
    if (Math.abs(info.offset.x) > minSwipeDistance) {
      if (info.offset.x > 0) {
        await like()
      } else {
        await dismiss()
      }
    } else {
      await animate.start({
        x: 0,
        transition: {
          duration: transitionDuration,
        },
      })
    }
  }

  const onDragStart: DragHandlers["onDragStart"] = () => {
    if (!hasBeenDragged) {
      setHasBeenDragged(true)
    }
  }

  return (
    <motion.article
      className={cn(
        "absolute flex flex-col justify-end overflow-hidden bg-slate-100",
        "size-full cursor-pointer overflow-hidden rounded-medium lg:h-[740px] lg:w-[360px]"
      )}
      drag={canSlide ? true : false}
      dragConstraints={{ left: -200, right: 200, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      animate={suggested.id === currentPet.id && animate}
      style={{ ...style, x, rotate, scale, opacity }}
    >
      <PetProfilePhotos
        photos={suggested.photos.map((p) => ({
          key: p.key,
          order: p.order,
          url: getImageUrl(p) ?? "",
        }))}
        dictionary={dictionary}
        isReadOnly
        fullHeight
        disableButtons={hasBeenDragged}
        topPagination
        isCurrent={isCurrent}
      />
      <header className="absoute bottom-0 left-0 h-max w-full">
        <div className="relative z-30 p-2">
          <div className="absolute bottom-0 left-0 z-[-1] h-[120%] w-full bg-gradient-to-b from-black/0 to-black/40 to-70%" />
          <div className="flex w-full flex-row items-center gap-2">
            <h3 className={"min-w-4 shrink-0 truncate text-2xl font-bold text-white"}>{suggested.name}</h3>
            <span className="text-2xl text-default-300">-</span>
            <div className="flex flex-row items-end gap-0.5">
              <p className="min-w-4 shrink-0 truncate text-2xl font-bold text-default-300">{age}</p>
              <div className="py-1 text-default-300">{age > 1 ? dictionary.yos : dictionary.yo}</div>
            </div>
          </div>
          <ChipsContainer
            dictionary={dictionary}
            breed={suggested.breed}
            characteristics={suggested.characteristics.map((c) => c.value)}
            isReadOnly
            chipsContainer={chipsContainer}
          />
        </div>
      </header>
      {suggested.distance && (
        <div className="absolute right-0 top-0 w-full font-bold text-slate-50">
          <div className="absolute left-0 top-0 z-10 h-[200%] w-full bg-gradient-to-t from-black/0 to-black/40 to-70%" />
          <div className="relative z-30 flex items-center justify-end gap-1 p-2">
            <MapPin className="size-4" />
            <p>
              {Math.round(suggested.distance / 100) / 10} {dictionary.km}
            </p>
          </div>
        </div>
      )}
    </motion.article>
  )
}
