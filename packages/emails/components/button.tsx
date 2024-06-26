import React, { ReactNode } from "react"

import { foreground, primary } from "@animadate/emails/contants"
import { Button as OButton, ButtonProps } from "@react-email/components"

export const Button = ({
  children,
  ...props
}: {
  children: ReactNode
} & ButtonProps) => {
  return (
    <OButton
      {...props}
      style={{
        ...buttonStyle,
        ...props.style,
      }}
    >
      {children}
    </OButton>
  )
}

const buttonStyle = {
  fontSize: "0.875rem",
  backgroundColor: primary,
  color: foreground,
  lineHeight: "1.25rem",
  borderRadius: "12px",
  padding: "10px 1rem",
  minWidth: "5rem",
} as const
