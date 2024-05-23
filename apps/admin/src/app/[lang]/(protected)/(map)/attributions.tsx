import Link from "next/link"

export default function Attribution() {
  return (
    <div className="absolute bottom-1 right-2 z-10 space-x-2 text-[10px] text-muted-foreground">
      <Link href="https://www.maptiler.com/copyright/" target="_blank">
        &copy; MapTiler
      </Link>
      <Link href="https://www.openstreetmap.org/copyright" target="_blank">
        &copy; OSM contributors
      </Link>
    </div>
  )
}
