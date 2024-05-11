"use client"

import { useRouter } from "next/navigation"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import { changePasswordSchema, changePasswordSchemaDr } from "@/api/me/schemas"
import CheckMarkAnimation from "@/components/ui/check-mark/check-mark"
import FormField from "@/components/ui/form"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn, sleep } from "@/lib/utils"
import { handleMutationError } from "@/lib/utils/client-utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, Spinner, useDisclosure } from "@nextui-org/react"

import { ChangePasswordDr } from "./change-password.dr"
import Row from "./row"

const formSchemaDr = dictionaryRequirements(changePasswordSchemaDr, {
  errors: {
    password: {
      dontMatch: true,
    },
  },
})
const formSchema = (dictionary: TDictionary<typeof formSchemaDr>) =>
  changePasswordSchema(dictionary)
    .extend({
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: dictionary.errors.password.dontMatch,
          path: ["confirmPassword"],
          fatal: true,
        })
      }
    })

export default function ChangePassword({
  dictionary,
  placement,
}: {
  dictionary: TDictionary<typeof ChangePasswordDr>
  placement: Parameters<typeof Row>[number]["placement"]
}) {
  const router = useRouter()
  const { isOpen, onOpenChange, onClose } = useDisclosure()

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(dictionary)),
    values: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const changePasswordMutation = trpc.me.changePassword.useMutation({
    onError: (error) => {
      const { message, code } = handleMutationError(error, dictionary, router, { showNotification: false })
      if (code === "invalidPassword") {
        return form.setError("currentPassword", {
          type: "manual",
          message: message,
        })
      } else if (code === "newPasswordSameAsCurrentPassword") {
        return form.setError("newPassword", {
          type: "manual",
          message: message,
        })
      } else {
        handleMutationError(error, dictionary, router)
      }
    },
    meta: {
      noDefaultErrorHandling: true,
    },
  })
  const handleChangePassword = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    await changePasswordMutation.mutateAsync(data)
    toast.success(dictionary.changedPasswordSuccessfully)
    // Close the modal after 1.5 second
    await sleep(1500)
    onClose()
    form.reset()
    changePasswordMutation.reset()
  }

  const isLoading = changePasswordMutation.isPending
  const isSuccess = changePasswordMutation.isSuccess

  return (
    <>
      <Row placement={placement} onPress={onOpenChange}>
        <KeyRound className="size-5" />
        {dictionary.changePassword}
      </Row>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.changePassword}</ModalTitle>
          </ModalHeader>
          <ModalBody className={cn("relative overflow-hidden")}>
            <form
              className="flex-1 space-y-2 px-1 transition-all md:px-0"
              onSubmit={form.handleSubmit(handleChangePassword)}
              id="change-password"
            >
              <FormField
                label={dictionary.currentPassword}
                type="password-eye-slash"
                form={form}
                name="currentPassword"
                autoComplete="current-password"
                autoFocus
              />
              <FormField
                label={dictionary.newPassword}
                type="password-eye-slash"
                form={form}
                name="newPassword"
                autoComplete="new-password"
                passwordStrength
                dictionary={dictionary}
              />
              <FormField
                label={dictionary.confirmPassword}
                type="password-eye-slash"
                form={form}
                name="confirmPassword"
                autoComplete="off"
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              {dictionary.cancel}
            </Button>
            <Button
              color={isSuccess ? "success" : "primary"}
              type="submit"
              form={"change-password"}
              isDisabled={isLoading}
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
              {isSuccess ? dictionary.success : dictionary.change}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
