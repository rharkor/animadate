import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

export type INeedSavePopupProps = {
  show: boolean
  onReset?: () => void
  onSave?: () => void
  text: string
  isSubmitting?: boolean
  dictionary: TDictionary<{
    reset: true
    saveChanges: true
  }>
}

export default function NeedSavePopup({ show, onReset, onSave, text, isSubmitting, dictionary }: INeedSavePopupProps) {
  return (
    <div
      className={cn("fixed bottom-0 left-1 right-1 z-50 mx-0 overflow-hidden pb-4 lg:left-2 lg:right-2", {
        "pointer-events-none invisible": !show,
      })}
    >
      <div
        className={cn(
          "m-auto flex w-max translate-y-full flex-col items-center justify-center space-y-2 rounded-3xl border border-foreground/10 bg-muted px-4 py-2 opacity-0 shadow-2xl transition-all max-sm:w-full lg:flex-row lg:space-x-4 lg:space-y-0",
          {
            "translate-y-0 animate-[bounce-up_1s_ease-out] opacity-100": show,
          }
        )}
      >
        <p className="text-sm text-foreground">{text}</p>
        <div className="flex flex-row gap-2">
          {/*//! Do not use onPress cause it will propagate to bottom bar */}
          <Button
            onClick={onReset}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onReset?.()
              }
            }}
            className="!bg-transparent px-2 text-primary"
            color="primary"
            type="button"
          >
            {dictionary.reset}
          </Button>
          {/*//! Do not use onPress cause it will propagate to bottom bar */}
          <Button
            onClick={onSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSave?.()
              }
            }}
            isLoading={isSubmitting}
            color="primary"
            type="submit"
          >
            {dictionary.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  )
}
