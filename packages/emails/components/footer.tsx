import React from "react"

import { Link } from "@animadate/emails/components/link"
import { mutedForeground } from "@animadate/emails/contants"
import { Container, Hr, Img, Text } from "@react-email/components"

export const Footer = ({
  supportEmail,
  footerText,
  logoUrl,
}: {
  supportEmail: string
  footerText: string
  logoUrl: string
}) => {
  const curYear = new Date().getFullYear()

  return (
    <Container style={footer}>
      <Text>
        {footerText}{" "}
        <Link
          href={`mailto:${supportEmail}`}
          style={{
            textDecoration: "underline",
            color: mutedForeground,
          }}
        >
          {supportEmail}
        </Link>
      </Text>
      <Hr style={hrStyle} />
      <Img src={logoUrl} width="32" height="32" alt="Animadate" style={imgStyle} />
      <Text style={subFooterTextStyle}>© {curYear} Animadate - All rights reserved</Text>
    </Container>
  )
}

const footer = {
  color: mutedForeground,
  fontSize: "12px",
  textAlign: "center",
  marginTop: "60px",
} as const

const hrStyle = {
  marginTop: "24px",
  borderColor: mutedForeground,
  opacity: 0.15,
  marginBottom: "12px",
} as const

const subFooterTextStyle = {
  fontSize: "12px",
  margin: "0",
  color: mutedForeground,
  textAlign: "start",
  marginTop: "12px",
} as const

const imgStyle = {
  // Grayscale
  filter: "grayscale(100%)",
} as const
