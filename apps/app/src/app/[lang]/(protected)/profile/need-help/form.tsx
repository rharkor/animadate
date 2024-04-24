"use client"

import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import { needHelpSchema } from "@/api/me/schemas"
import CheckMarkAnimation from "@/components/ui/check-mark/check-mark"
import FormField from "@/components/ui/form"
import { Locale } from "@/lib/i18n-config"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { sleep } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Spinner, Textarea } from "@nextui-org/react"

import { NeedHelpFormDr } from "./form.dr"

const formSchema = needHelpSchema

export default function NeedHelpForm({
  dictionary,
  ssrSession,
  lang,
}: {
  dictionary: TDictionary<typeof NeedHelpFormDr>
  ssrSession: Session | null
  lang: Locale
}) {
  const router = useRouter()
  const needHelpMutation = trpc.me.needHelp.useMutation()

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(dictionary)),
    values: {
      name: ssrSession?.user?.name ?? "",
      email: ssrSession?.user.email ?? "",
      message: "",
      locale: lang,
    },
  })

  const handleSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    await needHelpMutation.mutateAsync(data)
    // Sleep for 1s to let the user see the success message
    toast.success(dictionary.submitSuccess)
    await sleep(1000)
    router.push("/profile")
  }

  const isLoading = needHelpMutation.isLoading
  const isSuccess = needHelpMutation.isSuccess

  return (
    <>
      <p className="my-2 text-muted-foreground">{dictionary.needHelpDescription}</p>
      <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField form={form} name="name" type="text" label={dictionary.auth.name} />
        <FormField form={form} name="email" type="email" label={dictionary.contactEmail} />
        <Controller
          name={"message"}
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              isInvalid={!!form.formState.errors["message"]}
              errorMessage={form.formState.errors["message"]?.message?.toString()}
              label={dictionary.needHelpMessageLabel}
              classNames={{
                input: "min-h-[150px]",
              }}
            />
          )}
        />
        <Button
          type="submit"
          isDisabled={isLoading}
          color={isSuccess ? "success" : "primary"}
          startContent={
            isSuccess ? (
              <CheckMarkAnimation className="size-6 text-success-foreground" />
            ) : isLoading ? (
              <Spinner
                classNames={{
                  wrapper: "size-4",
                }}
                color="current"
                size="sm"
              />
            ) : (
              <></>
            )
          }
        >
          {isSuccess ? dictionary.submitSuccess : dictionary.submit}
        </Button>
      </form>
    </>
  )
}
