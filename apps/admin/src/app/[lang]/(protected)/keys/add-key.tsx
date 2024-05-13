"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { createApiKeySchema } from "@/api/keys/schemas"
import Copiable from "@/components/ui/copiable"
import FormField from "@/components/ui/form"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@nextui-org/react"

import { AddKeyDr } from "./add-key.dr"

const formSchema = createApiKeySchema()

export default function AddKey({ dictionary }: { dictionary: TDictionary<typeof AddKeyDr> }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const utils = trpc.useUtils()
  const [apiKeyPopup, setApiKeyPopup] = useState<{
    apiKeyId: string
    apiKeySecret: string
    isOpen: boolean
  }>({
    apiKeyId: "",
    apiKeySecret: "",
    isOpen: false,
  })

  const addKeyMutation = trpc.keys.createApiKey.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const res = await addKeyMutation.mutateAsync(data)
    setApiKeyPopup({
      apiKeyId: res.apiKeyId,
      apiKeySecret: res.apiKeySecret,
      isOpen: true,
    })
    utils.keys.invalidate()
    form.reset()
    onOpenChange()
  }

  return (
    <>
      <div
        className={cn(
          "relative hidden space-y-2 overflow-hidden rounded-medium border border-success bg-success-100 p-3",
          {
            block: apiKeyPopup.isOpen,
          }
        )}
      >
        <p className="font-medium">{dictionary.apiKeyCreated}</p>
        <p className="text-sm">{dictionary.apiKeyCreatedDesc}</p>
        <div className="flex flex-row gap-2">
          <p>{dictionary.id}</p>
          <Copiable
            dictionary={dictionary}
            text={apiKeyPopup.apiKeyId}
            size="md"
            classNames={{
              text: "bg-default-100/60",
              button: "bg-default-100/60",
            }}
          >
            {apiKeyPopup.apiKeyId}
          </Copiable>
        </div>
        <div className="flex flex-row gap-2">
          <p>{dictionary.secret}</p>
          <Copiable
            dictionary={dictionary}
            text={apiKeyPopup.apiKeySecret}
            size="md"
            classNames={{
              text: "bg-default-100/60",
              button: "bg-default-100/60",
            }}
          >
            {apiKeyPopup.apiKeySecret}
          </Copiable>
        </div>
        <Button
          className="absolute right-2 top-2 !mt-0 h-max min-w-0 rounded-full p-2"
          onPress={() => {
            setApiKeyPopup({
              apiKeyId: "",
              apiKeySecret: "",
              isOpen: false,
            })
          }}
        >
          <X className="size-3" />
        </Button>
      </div>
      <Button onPress={onOpen} className="ml-auto" color="primary" startContent={<Plus className="size-4" />}>
        {dictionary.addKey}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.addKey}</ModalHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <ModalBody>
                  <FormField form={form} label={dictionary.nameLiteral} type="text" name="name" autoFocus />
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    {dictionary.cancel}
                  </Button>
                  <Button color="primary" type="submit" isLoading={addKeyMutation.isPending}>
                    {dictionary.add}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
