import React from "react"

import { Link } from "@animadate/emails/components/link"
import { mutedForeground } from "@animadate/emails/contants"
import { Text } from "@react-email/components"

export const Footer = ({ supportEmail, footerText }: { supportEmail: string; footerText: string }) => {
  return (
    <Text style={footer}>
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
  )
}

const footer = {
  color: mutedForeground,
  fontSize: "12px",
  textAlign: "center",
  marginTop: "60px",
} as const
