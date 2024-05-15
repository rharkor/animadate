import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Button } from "@animadate/emails/components/button"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { muted } from "@animadate/emails/contants"
import { Container as OContainer, Head, Html, Img, Preview, Text } from "@react-email/components"

interface EventAlertProps {
  previewText: string
  logoUrl: string
  supportEmail: string
  titleText: string
  footerText: string
  message: string
  link: string
  textViewContent: string
}

export const EventAlert = ({
  previewText,
  logoUrl,
  message,
  supportEmail,
  titleText,
  footerText,
  link,
  textViewContent,
}: EventAlertProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body>
      <Container>
        <Img src={logoUrl} width="32" height="32" alt="Animadate" />
        <Text style={title}>{titleText}</Text>
        <Card>
          <OContainer style={messageContainer}>
            <pre style={messageText}>{message}</pre>
          </OContainer>
          <Button href={link}>{textViewContent}</Button>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: EventAlertProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  previewText: "myError.test",
  supportEmail: "support@animadate.com",
  titleText: "New error was reported",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  message: `Name: myError.test
Kind: OTHER
Level: ERROR
App: admin`,
  link: "https://animadate.com",
  textViewContent: "View error",
}
EventAlert.PreviewProps = previewProps

export default EventAlert

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const defaultText = {
  margin: "0",
  textAlign: "left",
} as const

const messageText = {
  ...defaultText,
  whiteSpace: "pre-wrap",
  fontFamily: "inherit",
  fontSize: "14px",
} as const

const messageContainer = {
  margin: "0 0 10px 0",
  padding: "10px",
  border: `1px solid ${muted}`,
  borderRadius: "12px",
} as const
