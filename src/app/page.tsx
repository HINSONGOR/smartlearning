import Link from "next/link";
import { getServices } from "@/services/container";

export default async function HomePage() {
  const modules = await getServices().curriculum.listHomeModules();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-on-primary">
        <p className="text-lg opacity-90">小六</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">今日想學咩？</h1>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => {
          const content = (
            <>
              <span aria-hidden className="text-4xl">
                {m.icon}
              </span>
              <span>
                <span className="block text-2xl font-bold">{m.name}</span>
                <span className={m.status === "active" ? "text-muted" : "text-muted/80"}>
                  {m.status === "active" ? m.description : "即將推出"}
                </span>
              </span>
            </>
          );
          const base = "flex min-h-28 items-center gap-4 rounded-3xl border p-6";
          return (
            <li key={m.id}>
              {m.status === "active" ? (
                <Link
                  href={`/learn/${m.id}`}
                  className={`${base} border-border bg-surface transition hover:border-primary hover:bg-primary-soft`}
                >
                  {content}
                </Link>
              ) : (
                <div aria-disabled className={`${base} border-dashed border-border opacity-60`}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
