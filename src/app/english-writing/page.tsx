import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { englishRoutes, routes } from "@/lib/routes";
import { getServices } from "@/services/container";

export default async function EnglishWritingPage() {
  const categories = await getServices().englishWriting.listCategories();
  return (
    <>
      <PageHeader back={{ href: routes.home(), label: "首頁" }} title="English Writing">
        <p className="text-lg text-muted">Choose a writing type 揀作文類型</p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2">
        {categories.map((c) => (
          <li key={c.id}>
            <NavCard
              href={englishRoutes.category(c.id)}
              icon={c.icon}
              title={c.name}
              subtitle={c.status === "active" ? [c.nameZh, c.description].filter(Boolean).join("｜") : "即將推出"}
              disabled={c.status !== "active"}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
