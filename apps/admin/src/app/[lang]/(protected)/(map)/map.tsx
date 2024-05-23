"use client"

import { useEffect, useRef, useState } from "react"
import { IControl, LngLat, Map as MLMap } from "maplibre-gl"

import { env } from "@/lib/env"
import { TDictionary } from "@/lib/langs"
import { maxDefaultRadius } from "@animadate/app-db/utils"
import { ScatterplotLayer } from "@deck.gl/layers"
import { MapboxOverlay } from "@deck.gl/mapbox"

import Attribution from "./attributions"
import { MapDr } from "./map.dr"
import Markers from "./markers"

const defaultCenter = new LngLat(-0.577966, 44.845125)
const defaultZoom = 14
const defaultRadius = 1000
const renderThrottle = 1500

export default function Map({ dictionary }: { dictionary: TDictionary<typeof MapDr> }) {
  //* Map
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)
  const [center, setCenter] = useState<LngLat>(defaultCenter)
  const [radius, setRadius] = useState(defaultRadius)
  useEffect(() => {
    if (!mapContainer.current) return

    const newMap =
      map.current ??
      new MLMap({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${env.NEXT_PUBLIC_MAP_API_KEY}`,
        center: defaultCenter,
        zoom: defaultZoom,
        attributionControl: false,
        minZoom: 14,
      })

    let lastRender = 0
    let renderTimeout: NodeJS.Timeout | null = null

    const refetchData = (center: LngLat, radius: number) => {
      setCenter(center)
      setRadius(radius)
    }

    const deckOverlay = new MapboxOverlay({
      layers: [],
    })

    const onRender = () => {
      const bounds = newMap.getBounds()
      // Get the radius of the bounds
      const radius = bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 2
      // Get the center of the bounds
      const center = bounds.getCenter()

      // Fetch data
      const now = Date.now()
      if (now - lastRender > renderThrottle) {
        lastRender = now
        refetchData(center, radius)
      } else {
        if (renderTimeout) clearTimeout(renderTimeout)
        renderTimeout = setTimeout(() => {
          lastRender = Date.now()
          refetchData(center, radius)
        }, renderThrottle)
      }

      // Display the radius
      deckOverlay.setProps({
        layers: [
          new ScatterplotLayer({
            id: "radius",
            data: [{ position: [center.lng, center.lat], radius }],
            getPosition: (d) => d.position,
            getFillColor: [0, 0, 255, 50],
            getRadius: (d) => Math.min(d.radius, maxDefaultRadius),
          }),
        ],
      })
    }

    newMap.on("render", onRender)

    newMap.once("load", () => {
      newMap.addControl(deckOverlay as IControl)
    })

    if (!map.current) {
      map.current = newMap
    }

    return () => {
      if (renderTimeout) clearTimeout(renderTimeout)
      newMap.off("render", onRender)
    }
  }, [])

  return (
    <>
      <div ref={mapContainer} className="h-full" />
      <Attribution />
      <Markers center={center} radius={radius} map={map} />
    </>
  )
}
