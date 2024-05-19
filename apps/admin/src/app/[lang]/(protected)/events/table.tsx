"use client"
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Eye } from "lucide-react"
import { codeToHtml } from "shiki"
import { z } from "zod"

import { eventSchema, getEventsResponseSchema, getEventsSchema, onNewEventResponseSchema } from "@/api/events/schemas"
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

import { EventsTableDr } from "./table.dr"
import TableTopContent from "./table-top-content"

type TKinds = z.infer<ReturnType<typeof getEventsSchema>>["kinds"]
type TLevels = z.infer<ReturnType<typeof getEventsSchema>>["levels"]

export default function EventsTable({
  dictionary,
  ssrData,
  defaultPage,
  defaultPerPage,
  defaultKinds,
  defaultLevels,
}: {
  dictionary: TDictionary<typeof EventsTableDr>
  ssrData: z.infer<ReturnType<typeof getEventsResponseSchema>>
  defaultPage: number
  defaultPerPage: number
  defaultKinds: TKinds
  defaultLevels: TLevels
}) {
  const utils = trpc.useUtils()
  const session = useSession()
  const [page, setPage] = useState(defaultPage)
  const [name, setName] = useState("")
  const [application, setApplication] = useState("")
  const [kinds, setKinds] = useState<TKinds>(defaultKinds)
  const [levels, setLevels] = useState<TLevels>(defaultLevels)

  const isInitialFilter =
    page === defaultPage &&
    name === "" &&
    JSON.stringify(kinds) === JSON.stringify(defaultKinds) &&
    JSON.stringify(levels) === JSON.stringify(defaultLevels) &&
    application === ""
  const events = trpc.events.getEvents.useQuery(
    {
      page,
      perPage: defaultPerPage,
      name,
      kinds,
      levels,
      application,
    },
    {
      initialData: isInitialFilter ? ssrData : undefined,
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

  //* Subscription
  const [needRefetch, setNeedRefetch] = useState(false)
  const handleSubscriptionData = (data: z.infer<ReturnType<typeof onNewEventResponseSchema>>) => {
    if (isInitialFilter && events.data) {
      utils.events.getEvents.setData(
        {
          page,
          perPage: defaultPerPage,
          name,
          kinds,
          levels,
          application,
        },
        {
          meta: events.data.meta,
          data: [data, ...events.data.data],
        }
      )
      utils.events.getEvents.invalidate(undefined, {
        refetchType: "none",
      })
    } else {
      // Do nothing with data because if the user have applied filter it will be hard to know if the new event should be displayed
      setNeedRefetch(true)
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    if (needRefetch) {
      const lastRefetch = events.dataUpdatedAt
      const limit = 1000 // Max 1 req/second
      const now = Date.now()
      if (now - lastRefetch < limit) {
        timeout = setTimeout(
          () => {
            events.refetch()
            setNeedRefetch(false)
          },
          limit - (now - lastRefetch)
        )
      } else {
        events.refetch()
        setNeedRefetch(false)
      }
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [needRefetch, events])

  trpc.events.onNewEvent.useSubscription(
    { uuid: session.data?.user?.uuid ?? "", userId: session.data?.user?.id ?? "" },
    {
      onData(data) {
        handleSubscriptionData(data)
      },
    }
  )

  return (
    <>
      <div className="relative z-0 flex w-full flex-col justify-between gap-4 rounded-large bg-content1 p-4 shadow-small">
        <TableTopContent
          dictionary={dictionary}
          name={name}
          setName={setName}
          kinds={kinds}
          setKinds={setKinds}
          levels={levels}
          setLevels={setLevels}
          application={application}
          setApplication={setApplication}
        />
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
              <TableColumn key={"app"} width={140}>
                {dictionary.appLiteral}
              </TableColumn>
              <TableColumn key={"kind"} width={160}>
                {dictionary.kind}
              </TableColumn>
              <TableColumn key={"level"} width={140}>
                {dictionary.level}
              </TableColumn>
              <TableColumn key={"createdAt"} width={250}>
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
                      <TableCell>{event.context.app}</TableCell>
                      <TableCell>{event.kind}</TableCell>
                      <TableCell>{event.level}</TableCell>
                      <TableCell>
                        <p className="flex flex-row justify-between" suppressHydrationWarning>
                          {getTimeBetween(new Date(event.context.date), new Date(), {
                            dictionary,
                          })}
                          <span className="ml-2 text-xs text-muted-foreground">({event.context.date})</span>
                        </p>
                      </TableCell>
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
        <ModalContent className="!my-0 h-full max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{viewData?.event.name}</ModalHeader>
              <ModalBody className="h-0">
                <div
                  dangerouslySetInnerHTML={{ __html: viewData?.prettyContent ?? "" }}
                  className="h-full [&>*]:h-full [&>*]:overflow-auto [&>*]:rounded-medium [&>*]:p-2"
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
