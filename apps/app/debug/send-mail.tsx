import { env } from "@/lib/env"
import { sendMail } from "@/lib/mailer"
import VerifyEmail, { previewProps } from "@animadate/emails/emails/verify-email"
import { render } from "@react-email/render"

const main = async () => {
  const element = VerifyEmail(previewProps)
  const text = render(element, {
    plainText: true,
  })
  const html = render(element)

  await sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: "louid.huort@gmail.com",
    subject: "TEST",
    text,
    html,
  })
}

main()
