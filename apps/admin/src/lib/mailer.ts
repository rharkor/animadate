import { createTransport } from "nodemailer"

import { env } from "@/lib/env"
import events from "@animadate/events-sdk"
import { logger } from "@animadate/lib"

import { getDefaultContext } from "./utils/events"
import { ApiError } from "./utils/server-utils"

export const configOptions = {
  port: env.SMTP_PORT,
  host: env.SMTP_HOST,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
}

const transporter = createTransport({
  port: configOptions.port,
  host: configOptions.host,
  auth: {
    user: configOptions.username,
    pass: configOptions.password,
  },
})

export const sendMail = async (...params: Parameters<typeof transporter.sendMail>) => {
  if (!env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE) {
    logger.error("Email service is disabled, sending email is skipped.")
    return ApiError("emailServiceDisabled", "PRECONDITION_FAILED")
  }
  try {
    const res = await transporter.sendMail(...params)
    logger.debug(`Email sent to ${res.envelope.to}`)
    events.push({
      name: "email.sent",
      kind: "MAILING",
      level: "INFO",
      context: getDefaultContext(),
      data: {
        from: params[0].from,
        to: params[0].to,
        subject: params[0].subject,
      },
    })
  } catch (error) {
    logger.error(`Error sending message: ${error}`)
    events.push({
      name: "email.error",
      kind: "MAILING",
      level: "ERROR",
      context: getDefaultContext(),
      data: {
        from: params[0].from,
        to: params[0].to,
        subject: params[0].subject,
        error,
      },
    })
    throw error
  }
}
