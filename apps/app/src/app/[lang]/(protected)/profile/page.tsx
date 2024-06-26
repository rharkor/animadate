import { headers } from "next/headers"
import { ContactRound, Dog, HeartHandshake, Link, MessageCircleQuestion, Settings2, UserRound } from "lucide-react"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import ChangeEmail from "./change-email"
import { ChangeEmailDr } from "./change-email.dr"
import ChangePassword from "./change-password"
import { ChangePasswordDr } from "./change-password.dr"
import DeleteAccount from "./delete-account"
import { DeleteAccountDr } from "./delete-account.dr"
import MinimizedProfile from "./minimized-profile"
import { MinimizedProfileDr } from "./minimized-profile.dr"
import Row from "./row"
import Section from "./section"
import SignOut from "./sign-out"
import { SignOutDr } from "./sign-out.dr"
import { containerClassName } from "./utils"

export default async function Profile({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  // Required due to the use of serverTrpc
  headers()

  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        profile: true,
        personalInformations: true,
        petProfile: true,
        myRelations: true,
        other: true,
        inviteYourFriend: true,
        preferences: true,
        needHelp: true,
        helpUs: true,
        security: true,
        deleteYourAccount: true,
      },
      MinimizedProfileDr,
      SignOutDr,
      DeleteAccountDr,
      ChangeEmailDr,
      ChangePasswordDr
    )
  )

  const account = await serverTrpc.me.getAccount()

  return (
    <main className={cn("container m-auto flex-1 overflow-auto p-3")}>
      <div className={cn(containerClassName, "items-center")}>
        <h1 className="sr-only">{dictionary.profile}</h1>
        <MinimizedProfile dictionary={dictionary} ssrAccount={account} />
        <Section title={dictionary.profile}>
          <Row placement="top" href="/profile/personal-informations">
            <UserRound className="size-5" />
            {dictionary.personalInformations}
          </Row>
          <Row placement="center" href="/profile/pet-profile">
            <Dog className="size-5" />
            {dictionary.petProfile}
          </Row>
          <Row placement="bottom">
            <ContactRound className="size-5" />
            {dictionary.myRelations}
          </Row>
        </Section>
        <Section title={dictionary.other}>
          <Row placement="top">
            <Link className="size-5" />
            {dictionary.inviteYourFriend}
          </Row>
          <Row placement="center" href="/profile/preferences">
            <Settings2 className="size-5" />
            {dictionary.preferences}
          </Row>
          <Row placement="center" href="/profile/need-help">
            <MessageCircleQuestion className="size-5" />
            {dictionary.needHelp}
          </Row>
          <Row placement="bottom">
            <HeartHandshake className="size-5" />
            {dictionary.helpUs}
          </Row>
        </Section>
        <Section title={dictionary.security}>
          <ChangeEmail dictionary={dictionary} ssrEmail={account.user.email} placement="top" />
          <ChangePassword dictionary={dictionary} placement="center" />
          <SignOut dictionary={dictionary} />
          <DeleteAccount dictionary={dictionary} />
        </Section>
      </div>
    </main>
  )
}
