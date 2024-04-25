import React, { ReactNode } from "react"

import { primary } from "@animadate/emails/contants"
import { Link as OLink, LinkProps } from "@react-email/components"

export const Link = ({
  children,
  ...props
}: {
  children: ReactNode
} & LinkProps) => {
  return (
    <OLink
      {...props}
      style={{
        ...linkStyle,
        ...props.style,
      }}
    >
      {children}
    </OLink>
  )
}

const linkStyle = {
  color: primary,
} as const
