"use client"

import React, { MutableRefObject, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { LngLat, Map, Marker } from "maplibre-gl"
import { renderToStaticMarkup } from "react-dom/server"
import { z } from "zod"

import { getProfilesLocationResponseSchema } from "@/api/map/schemas"
import { trpc } from "@/lib/trpc/client"
import { getImageUrl } from "@/lib/utils/client-utils"

const profileAlreadyExists = (
  markers: {
    marker: Marker
    data: z.infer<ReturnType<typeof getProfilesLocationResponseSchema>>[number]
    added: boolean
  }[],
  profile: z.infer<ReturnType<typeof getProfilesLocationResponseSchema>>[number]
) => {
  const matchingMarker = markers.find((marker) => marker.data.id === profile.id)
  // Not present
  if (!matchingMarker)
    return {
      exists: false,
      needToBeUpdated: false,
      matchingMarker: null,
    }
  // Present and different
  if (JSON.stringify(matchingMarker.data) !== JSON.stringify(profile))
    return {
      exists: true,
      needToBeUpdated: true,
      matchingMarker,
    }
  // Present and same
  return {
    exists: true,
    needToBeUpdated: false,
    matchingMarker,
  }
}

export default function Markers({
  center,
  radius,
  map,
  displayMarkers,
}: {
  center: LngLat
  radius: number
  map: MutableRefObject<Map | null>
  displayMarkers: boolean
}) {
  //* Add markers
  const [markers, setMarkers] = useState<
    { marker: Marker; data: z.infer<ReturnType<typeof getProfilesLocationResponseSchema>>[number]; added: boolean }[]
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

    const newMarkers: typeof markers = []
    const markersToRemove: typeof markers = []
    profiles.forEach((profile) => {
      const { exists, needToBeUpdated, matchingMarker } = profileAlreadyExists(markers, profile)

      const createMarker = () => {
        const element = document.createElement("div")
        element.style.zIndex = "10"
        element.innerHTML = renderToStaticMarkup(
          <div className="space-y-0.5 rounded-medium border border-default-400 bg-default-50 p-1">
            <Image
              src={getImageUrl(profile.pet.photos[0]) ?? ""}
              alt="pet photo"
              className="!size-12 rounded-full object-cover lg:!size-14"
              width={56}
              height={56}
            />
            <p className="text-center text-xs font-medium">{profile.pet.name}</p>
          </div>
        )
        const marker = new Marker({
          element,
        })
          .setLngLat([profile.location.longitude, profile.location.latitude])
          .addTo(curMap)
        newMarkers.push({ marker, data: profile, added: true })
        return marker
      }

      const removeMarker = () => {
        if (!matchingMarker) return
        matchingMarker.marker.remove()
        markersToRemove.push(matchingMarker)
      }

      if (!exists) {
        createMarker()
      } else if (needToBeUpdated) {
        // Remove the old marker
        removeMarker()
        // Create a new marker
        createMarker()
      }
    })

    // Remove markers that are not in the new list and add the new ones
    if (markersToRemove.length > 0 || newMarkers.length > 0) {
      const updatedState = markers.filter((marker) => !markersToRemove.includes(marker)).concat(newMarkers)
      setMarkers(updatedState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, radius])

  useEffect(() => {
    handleRenderMarker()
  }, [handleRenderMarker])

  //* Display markers setting
  useEffect(() => {
    const curMap = map.current
    if (!curMap) return

    markers.forEach((marker) => {
      if (displayMarkers) {
        marker.marker.addTo(curMap)
        marker.added = true
      } else {
        marker.marker.remove()
        marker.added = false
      }
    })
  }, [displayMarkers, markers, map])

  return <></>
}
