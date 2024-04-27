import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { muted, mutedForeground } from "@animadate/emails/contants"
import { Container as OContainer, Head, Html, Img, Preview, Text } from "@react-email/components"

interface NeedHelpSupportProps {
  previewText: string
  logoUrl: string
  supportEmail: string
  titleText: string
  footerText: string
  message: string
  user: {
    id: string
    name: string
    email: string
  }
}

export const NeedHelpSupport = ({
  previewText,
  logoUrl,
  message,
  user,
  supportEmail,
  titleText,
  footerText,
}: NeedHelpSupportProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body>
      <Container>
        <Img src={logoUrl} width="32" height="32" alt="Animadate" />
        <Text style={title}>{titleText.replace("{name}", user.name)}</Text>
        <Card>
          <OContainer style={messageContainer}>
            <pre style={messageText}>{message}</pre>
          </OContainer>
          <OContainer style={additionalInfoContainerStyle}>
            <Text style={defaultText}>From: {user.email}</Text>
            <Text style={defaultText}>User ID: {user.id}</Text>
          </OContainer>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: NeedHelpSupportProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  previewText: "Need help request.",
  supportEmail: "support@animadate.com",
  titleText: "{name} need's help",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  user: {
    id: "clvdmtxx90000xal1el4rtmsx",
    name: "John Doe",
    email: "johndoe@gmail.com",
  },
  message: "Hello,\n\nHow can I delete peoples that I've matched with?\n\nThanks,\nJohn Doe",
}
NeedHelpSupport.PreviewProps = previewProps

export default NeedHelpSupport

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

const additionalInfoContainerStyle = {
  fontSize: "12px",
  color: mutedForeground,
} as const
