import {
  ContactRound,
  Dog,
  HeartHandshake,
  KeyRound,
  Link,
  LogOut,
  Mail,
  MessageCircleQuestion,
  Settings2,
  Trash,
  UserRound,
} from "lucide-react"

import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import MinimizedProfile from "./minimized-profile"
import { MinimizedProfileDr } from "./minimized-profile.dr"
import Row from "./row"
import Section from "./section"

export default async function Profile({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
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
        changeEmail: true,
        changePassword: true,
        deleteYourAccount: true,
        signOut: true,
      },
      MinimizedProfileDr
    )
  )

  const account = await serverTrpc.me.getAccount()

  return (
    <main className={cn("container m-auto flex flex-1 flex-col items-center gap-3 overflow-auto p-3")}>
      <h1 className="sr-only">{dictionary.profile}</h1>
      <MinimizedProfile dictionary={dictionary} ssrAccount={account} />
      <Section title={dictionary.profile}>
        <Row placement="top">
          <UserRound className="size-5" />
          {dictionary.personalInformations}
        </Row>
        <Row placement="center">
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
        <Row placement="center">
          <Settings2 className="size-5" />
          {dictionary.preferences}
        </Row>
        <Row placement="center">
          <MessageCircleQuestion className="size-5" />
          {dictionary.needHelp}
        </Row>
        <Row placement="bottom">
          <HeartHandshake className="size-5" />
          {dictionary.helpUs}
        </Row>
      </Section>
      <Section title={dictionary.security}>
        <Row placement="top">
          <Mail className="size-5" />
          {dictionary.changeEmail}
        </Row>
        <Row placement="center">
          <KeyRound className="size-5" />
          {dictionary.changePassword}
        </Row>
        <Row placement="center" className="text-danger hover:!bg-danger-100" color="danger">
          <LogOut className="size-5" />
          {dictionary.signOut}
        </Row>
        <Row placement="bottom" className="bg-danger-50 text-danger hover:!bg-danger-100" color="danger">
          <Trash className="size-5" />
          {dictionary.deleteYourAccount}
        </Row>
      </Section>
    </main>
  )
}
