export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 w-full sm:max-w-lg">
      <h2 className="text-small font-medium uppercase text-muted-foreground">{title}</h2>
      <div className="mt-2 rounded-large shadow sm:shadow-medium">{children}</div>
    </section>
  )
}
