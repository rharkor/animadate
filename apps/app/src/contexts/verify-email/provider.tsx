"use client"

import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import { useAccount } from "@/hooks/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { logger } from "@animadate/lib"
import { Button, Modal, ModalBody, ModalContent } from "@nextui-org/react"

import { VerifyEmailContext } from "./context"
import { VerifyEmailDr } from "./verify-email.dr"

export default function VerifyEmailProvider({
  children,
  dictionary,
  emailNotVerifiedSSR,
}: {
  children: React.ReactNode
  dictionary: TDictionary<typeof VerifyEmailDr>
  emailNotVerifiedSSR: boolean
}) {
  const account = useAccount()
  const utils = trpc.useUtils()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const emailNotVerified = account.data ? account.data.user.emailVerified === null : emailNotVerifiedSSR

  useEffect(() => {
    if (emailNotVerified) {
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [account.data, emailNotVerified])

  // Poll for email verification status if not verified and modal is open
  useEffect(() => {
    if (isModalOpen) {
      const interval = setInterval(() => {
        utils.me.getAccount.invalidate()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isModalOpen, utils.me.getAccount])

  const resendVerificationEmailMutation = trpc.me.sendVerificationEmail.useMutation({
    onSuccess: () => {
      toast(dictionary.emailVerificationSentDescription)
    },
  })

  const handleResendVerificationEmail = () => {
    if (!account.data?.user.email) {
      logger.error("No email found in session")
      return
    }
    resendVerificationEmailMutation.mutate({
      email: account.data?.user.email,
    })
  }

  return (
    <VerifyEmailContext.Provider
      value={{
        isOpen: isModalOpen,
      }}
    >
      <Modal isOpen={isModalOpen} hideCloseButton>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.verifyEmailModal.title}</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <p>{dictionary.verifyEmailModal.description}</p>
                <p className="text-xs text-muted-foreground">{dictionary.verifyEmailModal.notReceived}</p>
                <Button
                  onClick={handleResendVerificationEmail}
                  isLoading={resendVerificationEmailMutation.isLoading}
                  variant="flat"
                  color="primary"
                >
                  {dictionary.resendVerificationEmail}
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {children}
    </VerifyEmailContext.Provider>
  )
}
