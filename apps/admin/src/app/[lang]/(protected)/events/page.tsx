import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang, {})

  return (
    <main className="container m-auto flex flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">Events</h1>
    </main>
  )
}
