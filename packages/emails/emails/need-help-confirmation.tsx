import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { Head, Html, Img, Preview, Text } from "@react-email/components"

interface NeedHelpConfirmationProps {
  previewText: string
  logoUrl: string
  name: string
  supportEmail: string
  titleText: string
  footerText: string
  contentTitle: string
  heyText: string
}

export const NeedHelpConfirmation = ({
  previewText,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  heyText,
}: NeedHelpConfirmationProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body>
      <Container>
        <Img src={logoUrl} width="32" height="32" alt="Animadate" />
        <Text style={title}>{titleText}</Text>
        <Card>
          <Text style={text}>
            {heyText} <strong>{name}</strong>!
          </Text>
          <Text style={text}>{contentTitle}</Text>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: NeedHelpConfirmationProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  name: "John Doe",
  previewText: "Message to confirm your request.",
  supportEmail: "support@animadate.com",
  titleText: "Your request has been sent",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle: "We have received your message and will get back to you as soon as possible.",
  heyText: "Hey",
}
NeedHelpConfirmation.PreviewProps = previewProps

export default NeedHelpConfirmation

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const
