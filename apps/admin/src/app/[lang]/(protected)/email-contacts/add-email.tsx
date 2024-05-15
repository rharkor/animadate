"use client"

import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { createEmailContactchema } from "@/api/email-contacts/schemas"
import FormField from "@/components/ui/form"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@nextui-org/react"

import { AddEmailContactDr } from "./add-email.dr"

const formSchema = createEmailContactchema()

export default function AddEmailContact({ dictionary }: { dictionary: TDictionary<typeof AddEmailContactDr> }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const utils = trpc.useUtils()

  const addEmailContactMutation = trpc.emailContacts.createEmailContact.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await addEmailContactMutation.mutateAsync(data)
    utils.emailContacts.invalidate()
    form.reset()
    onOpenChange()
  }

  return (
    <>
      <Button onPress={onOpen} className="ml-auto" color="primary" startContent={<Plus className="size-4" />}>
        {dictionary.addEmailContact}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.addEmailContact}</ModalHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <ModalBody>
                  <FormField form={form} label={dictionary.email} type="text" name="email" autoFocus />
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    {dictionary.cancel}
                  </Button>
                  <Button color="primary" type="submit" isLoading={addEmailContactMutation.isPending}>
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
