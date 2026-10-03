import { NavCard } from "@/components/ui/NavCard";
import { moduleHref } from "@/modules/registry";
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
        {modules.map((m) => (
          <li key={m.id}>
            <NavCard
              href={moduleHref(m)}
              icon={m.icon}
              title={m.name}
              subtitle={m.status === "active" ? m.description : "即將推出"}
              disabled={m.status !== "active"}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
