import { notFound } from "next/navigation";
import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { englishRoutes } from "@/lib/routes";
import { getServices } from "@/services/container";

export const dynamicParams = false;
export async function generateStaticParams() {
  const categories = await getServices().englishWriting.listCategories();
  return categories.filter((c) => c.status === "active").map((c) => ({ categoryId: c.id }));
}

export default async function EnglishCategoryPage({
  params,
}: PageProps<"/english-writing/[categoryId]">) {
  const { categoryId } = await params;
  const { englishWriting } = getServices();
  const category = await englishWriting.getCategory(categoryId);
  if (!category || category.status !== "active") notFound();
  const formats = await englishWriting.listPictureFormats(categoryId);

  return (
    <>
      <PageHeader back={{ href: englishRoutes.home(), label: "English Writing" }} title={category.name}>
        <p className="text-lg text-muted">{category.nameZh}</p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2">
        {formats.map((f) => (
          <li key={f.id}>
            <NavCard
              href={englishRoutes.format(categoryId, f.id)}
              icon="🖼️"
              title={f.name}
              subtitle={f.status === "active" ? [f.nameZh, f.description].filter(Boolean).join("｜") : "即將推出"}
              disabled={f.status !== "active"}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
