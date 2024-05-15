import { redirect } from "next/navigation"

export default async function Home() {
  redirect("/events")

  // const dictionary = await getDictionary(lang, {
  //   homePage: {
  //     title: true,
  //   },
  // })

  // return (
  //   <>
  //     <h1 className="text-4xl font-bold">{dictionary.homePage.title}</h1>
  //   </>
  // )
}
