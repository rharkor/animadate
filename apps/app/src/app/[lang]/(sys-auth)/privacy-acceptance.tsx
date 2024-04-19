import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Link } from "@nextui-org/link"

import { PrivacyAcceptanceDr } from "./privacy-acceptance.dr"

export default function PrivacyAcceptance({
  dictionary,
  className,
}: {
  dictionary: TDictionary<typeof PrivacyAcceptanceDr>
  className?: string
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {dictionary.auth.clickingAggreement}{" "}
      <Link href="/terms" className="inline text-xs underline underline-offset-2 hover:text-primary">
        {dictionary.auth.termsOfService}
      </Link>{" "}
      {dictionary.and}{" "}
      <Link href="/privacy" className="inline text-xs underline underline-offset-2 hover:text-primary">
        {dictionary.auth.privacyPolicy}
      </Link>
      .
    </p>
  )
}
