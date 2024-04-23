import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
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
    <main className="container m-auto flex max-w-lg flex-1 flex-col items-center gap-3 overflow-auto p-3">
      <h1 className="sr-only">{dictionary.profile}</h1>
      <MinimizedProfile dictionary={dictionary} ssrAccount={account} />
      <Section title={dictionary.profile}>
        <Row placement="top">{dictionary.personalInformations}</Row>
        <Row placement="center">{dictionary.petProfile}</Row>
        <Row placement="bottom">{dictionary.myRelations}</Row>
      </Section>
      <Section title={dictionary.other}>
        <Row placement="top">{dictionary.inviteYourFriend}</Row>
        <Row placement="center">{dictionary.preferences}</Row>
        <Row placement="center">{dictionary.needHelp}</Row>
        <Row placement="bottom">{dictionary.helpUs}</Row>
      </Section>
      <Section title={dictionary.security}>
        <Row placement="top">{dictionary.changeEmail}</Row>
        <Row placement="center">{dictionary.changePassword}</Row>
        <Row placement="center" className="text-danger hover:!bg-danger-100" color="danger">
          {dictionary.signOut}
        </Row>
        <Row placement="bottom" className="bg-danger-50 text-danger hover:!bg-danger-100" color="danger">
          {dictionary.deleteYourAccount}
        </Row>
      </Section>
    </main>
  )
}
