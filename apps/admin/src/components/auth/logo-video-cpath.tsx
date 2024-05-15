import { videoLink, videoPosterLink } from "@/constants/medias"
import { cn } from "@/lib/utils"

export default function LogoVideoCPath({ className }: { className?: string }) {
  return (
    <div
      style={{
        clipPath: "url(#logo-clip-path)",
        WebkitClipPath: "url(#logo-clip-path)",
      }}
      className={cn("aspect-square h-max w-max overflow-hidden", className)}
    >
      <video autoPlay muted loop className="min-h-full min-w-full bg-default-600 object-cover" poster={videoPosterLink}>
        <source src={videoLink} type="video/mp4" />
      </video>
      <svg height="0" width="0">
        <clipPath id="logo-clip-path" clipPathUnits="objectBoundingBox">
          <path
            d="M0.500199 0.260842C0.500199 0.387642 0.397407 0.490434 0.270607 0.490434H0.0410156V0.260842C0.0410156 0.134042 0.143807 0.03125 0.270607 0.03125C0.397407 0.03125 0.500199 0.134042 0.500199 0.260842Z"
            fill="#6AD2E7"
          />
          <path
            d="M0.5 0.719826C0.5 0.593026 0.602792 0.490234 0.729592 0.490234H0.959184V0.719826C0.959184 0.846626 0.856392 0.949418 0.729592 0.949418C0.602792 0.949418 0.5 0.846626 0.5 0.719826Z"
            fill="#6AD2E7"
          />
          <path
            d="M0.0410156 0.719826C0.0410156 0.846626 0.143807 0.949418 0.270607 0.949418H0.500199V0.719826C0.500199 0.593026 0.397407 0.490234 0.270607 0.490234C0.143807 0.490234 0.0410156 0.593026 0.0410156 0.719826Z"
            fill="#6AD2E7"
          />
          <path
            d="M0.959184 0.260842C0.959184 0.134042 0.856392 0.03125 0.729592 0.03125H0.5V0.260842C0.5 0.387642 0.602792 0.490434 0.729592 0.490434C0.856392 0.490434 0.959184 0.387642 0.959184 0.260842Z"
            fill="#6AD2E7"
          />
        </clipPath>
      </svg>
      {/* <svg width="0" height="0">
        <clipPath id="logo-clip-path" clipPathUnits="objectBoundingBox">
          <path d="M0.75815095,0.0579477769 C0.879893708,0.187288937 0.902165272,0.677587654 0.799370955,0.785996249 C0.627963035,0.966765889 0.26163708,0.91434951 0.111342491,0.755791573 C-0.0332137967,0.603287436 -0.035795248,0.382887577 0.0965066612,0.173955315 C0.200239457,0.0101396315 0.648923894,-0.0580965318 0.75815095,0.0579477769 Z"></path>
        </clipPath>
      </svg> */}
    </div>
  )
}
