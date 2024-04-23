"use client"

import { z } from "zod"

import { getAccountResponseSchema } from "@/api/me/schemas"
import Copiable from "@/components/ui/copiable"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { getFallbackAvatar, getImageUrl } from "@/lib/utils/client-utils"
import { Avatar } from "@nextui-org/react"

import { MinimizedProfileDr } from "./minimized-profile.dr"

export default function MinimizedProfile({
  dictionary,
  ssrAccount,
}: {
  dictionary: TDictionary<typeof MinimizedProfileDr>
  ssrAccount: z.infer<ReturnType<typeof getAccountResponseSchema>>
}) {
  const account = useAccount().data ?? ssrAccount
  const fallbackIcon = getFallbackAvatar(account.user.name)

  const onSocialIdClick = (textRef: React.RefObject<HTMLParagraphElement>) => {
    if (textRef.current) {
      const range = document.createRange()
      range.selectNode(textRef.current)
      // Do not select ID prefix
      range.setStart(textRef.current.firstChild!, 4)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
  }

  return (
    <section>
      <Avatar
        src={getImageUrl(account.user.profilePicture) ?? fallbackIcon}
        fallback={<></>}
        className="mx-auto !size-20"
      />
      <h2 className="mx-auto mt-2 text-center text-large">{account.user.name}</h2>
      <Copiable
        text={account.user.socialId}
        dictionary={dictionary}
        className="text-center text-small text-muted-foreground"
        onClick={onSocialIdClick}
      >
        ID: {account.user.socialId}
      </Copiable>
    </section>
  )
}
