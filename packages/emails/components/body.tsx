import React, { ReactNode } from "react"

import { background, foreground } from "@animadate/emails/contants"
import { Body as OBody, BodyProps } from "@react-email/components"

export const Body = ({
  children,
  ...props
}: {
  children: ReactNode
} & BodyProps) => {
  return (
    <OBody
      {...props}
      style={{
        ...bodyStyle,
        ...props.style,
      }}
    >
      {children}
    </OBody>
  )
}

const bodyStyle = {
  backgroundColor: background,
  color: foreground,
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
} as const
