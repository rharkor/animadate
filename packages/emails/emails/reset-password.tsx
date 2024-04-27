import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Button } from "@animadate/emails/components/button"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { Head, Html, Img, Preview, Text } from "@react-email/components"

interface ResetPasswordProps {
  resetLink: string
  previewText: string
  logoUrl: string
  name: string
  supportEmail: string
  titleText: string
  footerText: string
  contentTitle: string
  actionText: string
  heyText: string
}

export const ResetPassword = ({
  resetLink,
  previewText,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  actionText,
  heyText,
}: ResetPasswordProps) => (
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
          <Button href={resetLink}>{actionText}</Button>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: ResetPasswordProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  name: "John Doe",
  previewText: "Reset password request.",
  supportEmail: "support@animadate.com",
  resetLink: "https://animadate.com/reset-password?token=abc123",
  titleText: "Reset your password",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle: "You recently requested to reset your password for your account. Click the button below to reset it.",
  actionText: "Reset your password",
  heyText: "Hey",
}
ResetPassword.PreviewProps = previewProps

export default ResetPassword

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const
