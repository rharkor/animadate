import Link from "next/link"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"

import { PrivacyAcceptanceDr } from "./privacy-acceptance.dr"

export default function PrivacyAcceptance({
  dictionary,
  className,
}: {
  dictionary: TDictionary<typeof PrivacyAcceptanceDr>
  className?: string
}) {
  return (
    <p className={cn("text-xs", className)}>
      {dictionary.auth.clickingAggreement}{" "}
      <Link href="/terms" className={"inline text-xs text-primary underline underline-offset-2 hover:opacity-80"}>
        {dictionary.auth.termsOfService}
      </Link>{" "}
      {dictionary.and}{" "}
      <Link href="/privacy" className="inline text-xs text-primary underline underline-offset-2 hover:opacity-80">
        {dictionary.auth.privacyPolicy}
      </Link>
      .
    </p>
  )
}
