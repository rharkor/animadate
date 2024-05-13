"use client"
import React, { useState } from "react"
import { Eye } from "lucide-react"
import { codeToHtml } from "shiki"
import { z } from "zod"

import { eventSchema, getEventsResponseSchema } from "@/api/events/schemas"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
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

import { EventsTableDr } from "./table.dr"

export default function EventsTable({
  dictionary,
  ssrData,
  defaultPage,
  defaultPerPage,
}: {
  dictionary: TDictionary<typeof EventsTableDr>
  ssrData: z.infer<ReturnType<typeof getEventsResponseSchema>>
  defaultPage: number
  defaultPerPage: number
}) {
  const [page, setPage] = useState(defaultPage)

  const events = trpc.events.getEvents.useQuery(
    {
      page,
      perPage: defaultPerPage,
    },
    {
      initialData: page === defaultPage ? ssrData : undefined,
    }
  )

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [viewData, setViewData] = useState<{
    event: z.infer<ReturnType<typeof eventSchema>>
    prettyContent: string
  } | null>(null)
  const showViewModal = (event: z.infer<ReturnType<typeof eventSchema>>) => async () => {
    const prettyContent = await codeToHtml(JSON.stringify(event, null, 2), {
      lang: "json",
      theme: "catppuccin-mocha",
    })
    setViewData({
      event,
      prettyContent,
    })
    onOpen()
  }

  return (
    <>
      <div className="relative z-0 flex w-full flex-col justify-between gap-4 rounded-large bg-content1 p-4 shadow-small">
        <div className="min-h-[500px] overflow-auto">
          <Table
            aria-label={dictionary.eventsList}
            removeWrapper
            classNames={{
              tbody: "[&_td]:whitespace-nowrap",
            }}
          >
            <TableHeader>
              <TableColumn key={"name"} className="min-w-[340px]">
                {dictionary.nameLiteral}
              </TableColumn>
              <TableColumn key={"kind"} width={140}>
                {dictionary.kind}
              </TableColumn>
              <TableColumn key={"level"} width={140}>
                {dictionary.level}
              </TableColumn>
              <TableColumn key={"createdAt"} width={200}>
                {dictionary.createdAt}
              </TableColumn>
              <TableColumn width={100}>{dictionary.actions}</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={dictionary.noData}
              isLoading={events.isLoading}
              loadingContent={<Spinner label={dictionary.loading + "..."} />}
            >
              {events.data
                ? events.data.data.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.kind}</TableCell>
                      <TableCell>{event.level}</TableCell>
                      <TableCell>{new Date(event.context.date).toDateString()}</TableCell>
                      <TableCell className="flex flex-row justify-end gap-2">
                        <Button
                          color="primary"
                          variant="flat"
                          onPress={showViewModal(event)}
                          className="h-max min-w-0 rounded-full p-2"
                        >
                          <Eye className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </div>
        {(events.data?.meta.totalPages ?? 0) > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={events.data?.meta.totalPages ?? 0}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{viewData?.event.name}</ModalHeader>
              <ModalBody>
                <div
                  dangerouslySetInnerHTML={{ __html: viewData?.prettyContent ?? "" }}
                  className="[&>*]:overflow-auto [&>*]:rounded-medium [&>*]:p-2"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {dictionary.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
