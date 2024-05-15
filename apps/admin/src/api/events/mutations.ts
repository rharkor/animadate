import { z } from "zod"

import { logoUrl } from "@/constants/medias"
import { env } from "@/lib/env"
import { _getDictionary } from "@/lib/langs"
import { sendMail } from "@/lib/mailer"
import { eventsPrisma } from "@/lib/prisma/events"
import { redis } from "@/lib/redis"
import { canSendEventAlertEmail } from "@/lib/utils/events"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import EventAlertTemplate from "@animadate/emails/emails/event-alert"
import { render } from "@react-email/render"

import { onNewEventResponseSchema, pushEventResponseSchema, pushEventSchema } from "./schemas"

export const pushEvent = async ({ input }: apiInputFromSchema<typeof pushEventSchema>) => {
  try {
    const data = input
    const event = await eventsPrisma.event.create({
      data,
    })

    //? Trigger the invitation event
    const emitter = redis.duplicate()
    await emitter.connect().catch(() => {})
    const eventData = onNewEventResponseSchema().parse(event)
    await emitter.publish(`on-new-event`, JSON.stringify(eventData))

    //? Send alert email if needed
    if (data.level === "ERROR") {
      const canSend = await canSendEventAlertEmail()
      if (canSend) {
        const dictionary = await _getDictionary("transactionals", "en", {
          footer: true,
          newErrorWasReported: true,
          name: true,
          kind: true,
          level: true,
          app: true,
          viewError: true,
        })
        const eventAlertElement = EventAlertTemplate({
          footerText: dictionary.footer,
          logoUrl,
          message: `${dictionary.name}: ${data.name}\n${dictionary.kind}: ${data.kind}\n${dictionary.level}: ${data.level}\n${dictionary.app}: ${data.context.app}`,
          previewText: `${dictionary.name}: ${data.name} (${data.context.app})`,
          supportEmail: env.SUPPORT_EMAIL,
          titleText: dictionary.newErrorWasReported,
          link: `${env.NEXT_PUBLIC_BASE_URL}/events`,
          textViewContent: dictionary.viewError,
        })
        const eventAlertText = render(eventAlertElement, {
          plainText: true,
        })
        const eventAlertHtml = render(eventAlertElement)
        const contactEmails = await eventsPrisma.alertEmailContact.findMany()
        await Promise.all(
          contactEmails.map((email) => {
            return sendMail({
              from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
              to: email.email,
              subject: dictionary.newErrorWasReported,
              text: eventAlertText,
              html: eventAlertHtml,
            })
          })
        )
      }
    }

    const res: z.infer<ReturnType<typeof pushEventResponseSchema>> = {
      success: true,
    }
    return res
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
