"use client"
import { useState } from "react"
import { Trash } from "lucide-react"
import { z } from "zod"

import { getEmailContactsResponseSchema } from "@/api/email-contacts/schemas"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { getTimeBetween } from "@/lib/utils"
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react"

import { EmailContactsTableDr } from "./table.dr"
import TableTopContent from "./table-top-content"

export default function EmailContactsTable({
  dictionary,
  ssrData,
  defaultPage,
  defaultPerPage,
}: {
  dictionary: TDictionary<typeof EmailContactsTableDr>
  ssrData: z.infer<ReturnType<typeof getEmailContactsResponseSchema>>
  defaultPage: number
  defaultPerPage: number
}) {
  const utils = trpc.useUtils()

  const [page, setPage] = useState(defaultPage)
  const [email, setEmail] = useState("")

  const emailcontacts = trpc.emailContacts.getEmailContacts.useQuery(
    {
      page,
      perPage: defaultPerPage,
      email,
    },
    {
      initialData: page === defaultPage && email === "" ? ssrData : undefined,
    }
  )

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [willDeleteId, setWillDeleteId] = useState<string | null>(null)
  const showDeleteModal = (id: string) => async () => {
    setWillDeleteId(id)
    onOpen()
  }

  const deleteEmailContactMutation = trpc.emailContacts.deleteEmailContact.useMutation()
  const handleDelete = async () => {
    if (willDeleteId) {
      await deleteEmailContactMutation.mutateAsync({ id: willDeleteId })
      utils.emailContacts.invalidate()
    }
    onOpenChange()
  }

  return (
    <>
      <div className="relative z-0 flex w-full flex-col justify-between gap-4 rounded-large bg-content1 p-4 shadow-small">
        <TableTopContent dictionary={dictionary} email={email} setEmail={setEmail} />
        <div className="min-h-[500px] overflow-auto">
          <Table
            aria-label={dictionary.emailContacts}
            classNames={{
              tbody: "[&_td]:whitespace-nowrap",
            }}
            removeWrapper
          >
            <TableHeader>
              <TableColumn key={"email"}>{dictionary.email}</TableColumn>
              <TableColumn allowsSorting key={"createdAt"} width={200}>
                {dictionary.createdAt}
              </TableColumn>
              <TableColumn width={100}>{dictionary.actions}</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={dictionary.noData}
              isLoading={emailcontacts.isLoading}
              loadingContent={<Spinner label={dictionary.loading + "..."} />}
            >
              {emailcontacts.data
                ? emailcontacts.data.data.map((emailContact) => (
                    <TableRow key={emailContact.id}>
                      <TableCell>{emailContact.email}</TableCell>
                      <TableCell>
                        <p className="flex flex-row justify-between" suppressHydrationWarning>
                          {getTimeBetween(emailContact.createdAt, new Date(), {
                            dictionary,
                          })}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({emailContact.createdAt.toISOString()})
                          </span>
                        </p>
                      </TableCell>
                      <TableCell className="flex flex-row justify-end gap-2">
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={showDeleteModal(emailContact.id)}
                          className="h-max min-w-0 rounded-full p-2"
                        >
                          <Trash className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </div>
        {(emailcontacts.data?.meta.totalPages ?? 0) > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={emailcontacts.data?.meta.totalPages ?? 0}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.deleteEmailContact}</ModalHeader>
              <ModalBody>
                <p>{dictionary.deleteEmailContactDescription}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {dictionary.cancel}
                </Button>
                <Button color="danger" isLoading={deleteEmailContactMutation.isPending} onPress={handleDelete}>
                  {dictionary.delete}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
