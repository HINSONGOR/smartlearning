export function PagePlaceholder({ icon, title }: { icon: string; title: string }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-8 text-center">
      <div aria-hidden className="mb-3 text-5xl">
        {icon}
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">建設中，即將推出</p>
    </section>
  );
}
