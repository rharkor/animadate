"use client"

import { useCallback } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getAccountResponseSchema, updateUserSchema } from "@/api/me/schemas"
import Copiable from "@/components/ui/copiable"
import FormField from "@/components/ui/form"
import NeedSavePopup from "@/components/ui/need-save-popup"
import { useAccount } from "@/hooks/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { logger } from "@animadate/lib"
import { zodResolver } from "@hookform/resolvers/zod"

import { UpdatePersonalInformationsDr } from "./update.dr"
import UpdateAvatar from "./update-avatar"

//? Only non sensible informations
// Example do not put the password or email here
const nonSensibleSchema = updateUserSchema

type INonSensibleForm = z.infer<ReturnType<typeof nonSensibleSchema>>

export default function UpdatePersonalInformations({
  dictionary,
  ssrAccount,
}: {
  dictionary: TDictionary<typeof UpdatePersonalInformationsDr>
  ssrAccount: z.infer<ReturnType<typeof getAccountResponseSchema>>
}) {
  const account = useAccount().data ?? ssrAccount
  const utils = trpc.useUtils()
  const { update } = useSession()

  const form = useForm<INonSensibleForm>({
    resolver: zodResolver(nonSensibleSchema(dictionary)),
    values: {
      name: account.user.name || "",
    },
  })

  const updateUserMutation = trpc.me.updateUser.useMutation({
    onSuccess: async (data) => {
      logger.debug("User updated")
      await update()
      utils.me.getAccount.invalidate()
      form.reset({
        name: data.user.name,
      })
    },
  })

  const onUpdateNonSensibleInforation = async (data: INonSensibleForm) => {
    updateUserMutation.mutate(data)
  }

  const resetForm = useCallback(() => {
    form.reset({
      name: account.user.name,
    })
  }, [account.user, form])

  const isDirty = form.formState.isDirty

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
    <>
      <UpdateAvatar dictionary={dictionary} account={account} />
      <Copiable
        text={account.user.socialId}
        dictionary={dictionary}
        className="text-center text-small text-muted-foreground"
        classNames={{
          container: "mx-auto",
        }}
        onClick={onSocialIdClick}
      >
        ID: {account.user.socialId}
      </Copiable>
      <form onSubmit={form.handleSubmit(onUpdateNonSensibleInforation)} className="grid flex-1 gap-2">
        <FormField
          form={form}
          name="name"
          label={dictionary.auth.name}
          type="text"
          isDisabled={updateUserMutation.isPending}
          size="sm"
        />
        <NeedSavePopup
          show={isDirty}
          onReset={resetForm}
          isSubmitting={updateUserMutation.isPending}
          text={dictionary.needSavePopup}
          dictionary={dictionary}
        />
      </form>
    </>
  )
}
