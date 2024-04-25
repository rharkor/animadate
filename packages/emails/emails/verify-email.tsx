import * as React from "react"

import { Body } from "@animadate/emails/components/body"
import { Button } from "@animadate/emails/components/button"
import { Card } from "@animadate/emails/components/card"
import { Container } from "@animadate/emails/components/container"
import { Footer } from "@animadate/emails/components/footer"
import { Head, Html, Img, Preview, Text } from "@react-email/components"

interface VerifyEmailProps {
  verificationLink: string
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

export const GithubAccessTokenEmail = ({
  verificationLink,
  previewText,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  actionText,
  heyText,
}: VerifyEmailProps) => (
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
          <Button href={verificationLink}>{actionText}</Button>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: VerifyEmailProps = {
  logoUrl: "https://animadate-public.s3.fr-par.scw.cloud/logo.png",
  name: "John Doe",
  previewText: "Verify your email address to complete your registration.",
  supportEmail: "support@animadate.com",
  verificationLink: "https://animadate.com/verify-email?token=abc123",
  titleText: "Verify your email address",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle:
    "Thanks for signing up for Animadate. To complete your registration, we just need to verify your email address.",
  actionText: "Verify email address",
  heyText: "Hey",
}
GithubAccessTokenEmail.PreviewProps = previewProps

export default GithubAccessTokenEmail

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
}
