"use client"

import React, { MutableRefObject, useCallback, useEffect, useState } from "react"
import { LngLat, Map, Marker } from "maplibre-gl"
import { createPortal } from "react-dom"
import { z } from "zod"

import { getProfilesLocationResponseSchema } from "@/api/map/schemas"
import { trpc } from "@/lib/trpc/client"
import { getImageUrl } from "@/lib/utils/client-utils"
import { Avatar } from "@nextui-org/react"

export default function Markers({
  center,
  radius,
  map,
}: {
  center: LngLat
  radius: number
  map: MutableRefObject<Map | null>
}) {
  //* Add markers
  const [markers, setMarkers] = useState<
    { marker: Marker; added: boolean; data: z.infer<ReturnType<typeof getProfilesLocationResponseSchema>>[number] }[]
  >([])

  const getProfilesMutation = trpc.map.getProfilesLocation.useMutation()

  const handleRenderMarker = useCallback(async () => {
    const curMap = map.current
    if (!curMap) return

    const profiles = await getProfilesMutation.mutateAsync({
      latitude: center.lat,
      longitude: center.lng,
      radius,
    })

    let newMarkers: typeof markers = []
    profiles.forEach((profile) => {
      const element = document.createElement("div")
      element.style.zIndex = "10"

      const marker = new Marker({
        element,
      }).setLngLat([profile.location.longitude, profile.location.latitude])

      newMarkers.push({
        marker,
        added: false,
        data: profile,
      })
    })

    // If marker with same id is already present, don't add it (only if it's the same)
    const oldMarkersToRemove: string[] = []
    const newMarkersToRemove: string[] = []
    newMarkers.forEach((newMarker) => {
      const alreadyPresent = markers.find((marker) => marker.data.id === newMarker.data.id)
      if (alreadyPresent) {
        // Same content
        if (JSON.stringify(alreadyPresent.data) === JSON.stringify(newMarker.data)) {
          newMarkersToRemove.push(newMarker.data.id)
        } else {
          // Different content
          oldMarkersToRemove.push(alreadyPresent.data.id)
        }
      }
    })
    const oldMarkersUpdated = markers.filter(
      (marker) => !oldMarkersToRemove.some((oldMarker) => oldMarker === marker.data.id)
    )
    newMarkers = newMarkers.filter((marker) => !newMarkersToRemove.some((newMarker) => newMarker === marker.data.id))
    // Add newMarkers to current markers
    const newStateMarkers = [...oldMarkersUpdated, ...newMarkers]
    newMarkers.forEach((marker) => {
      if (!marker.added) {
        marker.marker.addTo(curMap)
        marker.added = true
      }
    })
    setMarkers(newStateMarkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, radius])

  useEffect(() => {
    handleRenderMarker()
  }, [handleRenderMarker])

  return markers.map((marker) => {
    const element = marker.marker.getElement()
    if (!element) return null

    const profile = marker.data

    return createPortal(
      <div className="space-y-0.5 rounded-medium border border-default-400 bg-default-50/30 p-1 shadow backdrop-blur-sm">
        <Avatar
          src={getImageUrl(profile.pet.photos[0]) ?? ""}
          alt="pet photo"
          name={profile.pet.name}
          className="!size-12 lg:!size-14"
        />
        <p className="text-center text-xs font-medium">{profile.pet.name}</p>
      </div>,
      element
    )
  })
}
