import { cn } from "@/lib/utils"

export default function SmartPhoneDeviceLook({
  children,
  className,
  classNames,
}: {
  children?: React.ReactNode
  className?: string
  classNames?: {
    wrapper?: string
    container?: string
    plusButton?: string
    minusButton?: string
    powerButton?: string
  }
}) {
  return (
    <div className={cn("relative rounded-[22px] bg-slate-950 p-4 px-3", className, classNames?.wrapper)}>
      <div className={cn("overflow-hidden rounded-xl", classNames?.container)}>{children}</div>
      {/* Plus */}
      <div
        className={cn(
          "absolute -right-0.5 top-[120px] z-[-1] h-[50px] w-1 rounded-full bg-slate-950",
          classNames?.plusButton
        )}
      />
      {/* Minus */}
      <div
        className={cn(
          "absolute -right-0.5 top-[180px] z-[-1] h-[50px] w-1 rounded-full bg-slate-950",
          classNames?.minusButton
        )}
      />
      {/* Power */}
      <div
        className={cn(
          "absolute -right-0.5 top-[260px] z-[-1] h-[50px] w-1 rounded-full bg-slate-950",
          classNames?.powerButton
        )}
      />
    </div>
  )
}
