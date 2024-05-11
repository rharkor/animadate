"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"
import { toast } from "react-toastify"

import { ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { authRoutes } from "@/constants/auth"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { Button, Modal, ModalContent, ModalFooter, Spinner } from "@nextui-org/react"

import { DeleteAccountDr } from "./delete-account.dr"
import Row from "./row"

export default function DeleteAccount({
  dictionary,
}: {
  dictionary: TDictionary<typeof DeleteAccountDr>
  customButton?: boolean
}) {
  const router = useRouter()
  const deleteAccountMutation = trpc.me.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success(dictionary.deleteAccountSuccessDescription)
      router.push(authRoutes.signUp[0])
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const handleDeleteAccount = async () => {
    setIsLoading(true)
    await deleteAccountMutation.mutateAsync()
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Row
        placement="bottom"
        className="bg-danger-50 text-danger hover:!bg-danger-100"
        color="danger"
        onPress={() => setShowModal(true)}
      >
        {isLoading ? (
          <Spinner classNames={{ wrapper: "size-5" }} color="current" size="sm" />
        ) : (
          <Trash className="size-5" />
        )}
        {dictionary.deleteYourAccount}
      </Row>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.deleteAccountConfirmationTitle}</ModalTitle>
                <ModalDescription>{dictionary.deleteAccountConfirmationDescription}</ModalDescription>
              </ModalHeader>
              <ModalFooter>
                <Button onPress={onClose} variant="flat">
                  {dictionary.cancel}
                </Button>
                <Button color="danger" onPress={handleDeleteAccount} isLoading={isLoading}>
                  {dictionary.deleteAccountConfirm}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
