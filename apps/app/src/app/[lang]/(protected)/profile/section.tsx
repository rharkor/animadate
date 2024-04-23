export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 w-full">
      <h2 className="text-small font-medium uppercase text-muted-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
