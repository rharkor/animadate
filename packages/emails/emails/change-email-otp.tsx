import { muted } from "contants"
import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { CodeInline, Head, Html, Img, Preview, Text } from "@react-email/components"

interface ChangeEmailProps {
  previewText: string
  code: string
  logoUrl: string
  name: string
  supportEmail: string
  titleText: string
  footerText: string
  contentTitle: string
  heyText: string
}

export const ChangeEmail = ({
  previewText,
  code,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  heyText,
}: ChangeEmailProps) => (
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
          <div style={codeContainerStyle}>
            <CodeInline>{code}</CodeInline>
          </div>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: ChangeEmailProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  name: "John Doe",
  previewText: "New email address verification code.",
  supportEmail: "support@animadate.com",
  code: "123456",
  titleText: "Validate your new email",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle:
    "You have requested to change your email address. Please use the following code to validate your request.",
  heyText: "Hey",
}
ChangeEmail.PreviewProps = previewProps

export default ChangeEmail

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const

const codeContainerStyle = {
  backgroundColor: muted,
  borderRadius: "12px",
  fontSize: "22px",
  padding: "10px",
  width: "max-content",
  textAlign: "center",
  margin: "1rem auto 0",
} as const
