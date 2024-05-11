"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import { changeEmailSchema, validateChangeEmailSchema } from "@/api/me/schemas"
import CheckMarkAnimation from "@/components/ui/check-mark/check-mark"
import FormField from "@/components/ui/form"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { useAccount } from "@/hooks/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn, sleep } from "@/lib/utils"
import { handleMutationError } from "@/lib/utils/client-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, Spinner, useDisclosure } from "@nextui-org/react"

import { ChangeEmailDr } from "./change-email.dr"
import Row from "./row"

const form0Schema = changeEmailSchema
const form1Schema = validateChangeEmailSchema

export default function ChangeEmail({
  dictionary,
  ssrEmail,
  placement,
}: {
  dictionary: TDictionary<typeof ChangeEmailDr>
  ssrEmail: string
  placement: Parameters<typeof Row>[number]["placement"]
}) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const curEmail = useAccount().data?.user.email ?? ssrEmail
  const { isOpen, onOpenChange, onClose } = useDisclosure()

  const [formStep, setFormStep] = useState(0)

  const onPrevious = () => {
    setFormStep((prev) => prev - 1)
  }

  const onNext = () => {
    setFormStep((prev) => prev + 1)
  }

  const form0 = useForm<z.infer<ReturnType<typeof form0Schema>>>({
    resolver: zodResolver(form0Schema(dictionary)),
    values: {
      email: "",
      password: "",
    },
  })

  const changeEmailMutation = trpc.me.changeEmail.useMutation({
    onError: (error) => {
      const { message, code } = handleMutationError(error, dictionary, router, { showNotification: false })
      if (code?.toLowerCase().includes("password")) {
        return form0.setError("password", {
          type: "manual",
          message: message,
        })
      } else if (code?.toLowerCase().includes("email")) {
        return form0.setError("email", {
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
  const handleChangeEmail = async (data: z.infer<ReturnType<typeof form0Schema>>) => {
    await changeEmailMutation.mutateAsync(data)
    onNext()
  }

  const form1 = useForm<z.infer<ReturnType<typeof form1Schema>>>({
    resolver: zodResolver(form1Schema(dictionary)),
    values: {
      token: "",
    },
  })

  const validateChangeEmailMutation = trpc.me.validateChangeEmail.useMutation()
  const handleValidateChangeEmail = async (data: z.infer<ReturnType<typeof form1Schema>>) => {
    await validateChangeEmailMutation.mutateAsync(data)
    utils.me.getAccount.invalidate()
    toast.success(dictionary.changedEmailSuccessfully)
    // Close the modal after 1.5 second
    await sleep(1500)
    onClose()
    form0.reset()
    form1.reset()
    setFormStep(0)
    changeEmailMutation.reset()
    validateChangeEmailMutation.reset()
  }

  const isLoading = formStep === 0 ? changeEmailMutation.isPending : validateChangeEmailMutation.isPending
  const isSuccess = validateChangeEmailMutation.isSuccess

  return (
    <>
      <Row placement={placement} onPress={onOpenChange}>
        <Mail className="size-5" />
        {dictionary.changeEmail}
      </Row>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.changeEmail}</ModalTitle>
          </ModalHeader>
          <ModalBody className={cn("relative overflow-hidden")}>
            <motion.div
              className="flex w-[calc(200%+36px)] flex-row gap-9"
              animate={{
                translateX: `calc(-${(formStep / 2) * 100}% - ${formStep * 18}px)`,
              }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
            >
              <form
                className="flex-1 space-y-2 px-1 transition-all md:px-0"
                aria-hidden={formStep !== 0}
                style={{
                  pointerEvents: formStep !== 0 ? "none" : "auto",
                }}
                onSubmit={form0.handleSubmit(handleChangeEmail)}
                id="change-email"
              >
                <p className="text-sm text-muted-foreground">
                  {dictionary.currentEmail}: {curEmail}
                </p>
                <FormField label={dictionary.newEmail} type="email" form={form0} name="email" autoFocus />
                <FormField
                  label={dictionary.currentPassword}
                  type="password-eye-slash"
                  form={form0}
                  name="password"
                  autoComplete="current-password"
                />
              </form>
              <form
                className="flex-1 space-y-2 px-1 transition-all md:px-0"
                aria-hidden={formStep !== 1}
                style={{
                  pointerEvents: formStep !== 1 ? "none" : "auto",
                }}
                onSubmit={form1.handleSubmit(handleValidateChangeEmail)}
                id="validate-change-email"
              >
                <p className="text-sm text-muted-foreground">{dictionary.changeEmailTokenSentByMail}</p>
                <FormField label={dictionary.token} type="text" form={form1} name="token" />
              </form>
            </motion.div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={formStep === 0 ? onClose : onPrevious}>
              {formStep === 0 ? dictionary.cancel : dictionary.previous}
            </Button>
            <Button
              color={isSuccess ? "success" : "primary"}
              type="submit"
              form={formStep === 0 ? "change-email" : "validate-change-email"}
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
              {isSuccess ? dictionary.success : formStep === 0 ? dictionary.next : dictionary.change}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
