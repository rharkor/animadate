"use client"
import { useState } from "react"
import { Trash } from "lucide-react"
import { z } from "zod"

import { getApiKeysResponseSchema } from "@/api/keys/schemas"
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
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react"

import { KeysTableDr } from "./table.dr"

export default function KeysTable({
  dictionary,
  ssrData,
  defaultSort,
  defaultPage,
  defaultPerPage,
}: {
  dictionary: TDictionary<typeof KeysTableDr>
  ssrData: z.infer<ReturnType<typeof getApiKeysResponseSchema>>
  defaultSort: {
    field: string
    direction: "asc" | "desc"
  }[]
  defaultPage: number
  defaultPerPage: number
}) {
  const utils = trpc.useUtils()

  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(defaultPage)

  const keys = trpc.keys.getApiKeys.useQuery(
    {
      page,
      perPage: defaultPerPage,
      sort,
    },
    {
      initialData: page === defaultPage && JSON.stringify(sort) === JSON.stringify(defaultSort) ? ssrData : undefined,
    }
  )

  const onSortChange = (field: SortDescriptor) => {
    const { column, direction } = field
    if (!column || !direction) {
      setSort([])
    } else {
      setSort([{ field: column.toString(), direction: direction === "ascending" ? "asc" : "desc" }])
    }
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [willDeleteId, setWillDeleteId] = useState<string | null>(null)
  const showDeleteModal = (id: string) => async () => {
    setWillDeleteId(id)
    onOpen()
  }

  const deleteKeyMutation = trpc.keys.deleteApiKey.useMutation()
  const handleDelete = async () => {
    if (willDeleteId) {
      await deleteKeyMutation.mutateAsync({ id: willDeleteId })
      utils.keys.invalidate()
    }
    onOpenChange()
  }

  return (
    <>
      <div className="relative z-0 flex w-full flex-col justify-between gap-4 rounded-large bg-content1 p-4 shadow-small">
        <div className="min-h-[500px] overflow-auto">
          <Table
            aria-label={dictionary.manageApiKeys}
            onSortChange={onSortChange}
            sortDescriptor={{
              column: sort[0]?.field,
              direction: sort[0]?.direction === "asc" ? "ascending" : "descending",
            }}
            classNames={{
              tbody: "[&_td]:whitespace-nowrap",
            }}
            removeWrapper
          >
            <TableHeader>
              <TableColumn width={250}>{dictionary.id}</TableColumn>
              <TableColumn allowsSorting key={"name"}>
                {dictionary.nameLiteral}
              </TableColumn>
              <TableColumn key={"lastUsedAt"} width={200}>
                {dictionary.lastUsedAt}
              </TableColumn>
              <TableColumn allowsSorting key={"createdAt"} width={200}>
                {dictionary.createdAt}
              </TableColumn>
              <TableColumn width={100}>{dictionary.actions}</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={dictionary.noData}
              isLoading={keys.isLoading}
              loadingContent={<Spinner label={dictionary.loading + "..."} />}
            >
              {keys.data
                ? keys.data.data.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.id}</TableCell>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        {key.lastUsedAt === null
                          ? key.firstUsed !== null
                            ? ">30 " + dictionary.days
                            : dictionary.never
                          : getTimeBetween(key.lastUsedAt, new Date(), {
                              dictionary,
                            })}
                      </TableCell>
                      <TableCell>{key.createdAt.toDateString()}</TableCell>
                      <TableCell className="flex flex-row justify-end gap-2">
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={showDeleteModal(key.id)}
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
        {(keys.data?.meta.totalPages ?? 0) > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={keys.data?.meta.totalPages ?? 0}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.deleteKey}</ModalHeader>
              <ModalBody>
                <p>{dictionary.deleteKeyDescription}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {dictionary.cancel}
                </Button>
                <Button color="danger" isLoading={deleteKeyMutation.isPending} onPress={handleDelete}>
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
