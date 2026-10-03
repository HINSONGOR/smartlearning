import { notFound } from "next/navigation";
import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { englishRoutes } from "@/lib/routes";
import { getServices } from "@/services/container";

export const dynamicParams = false;
export async function generateStaticParams() {
  const formats = await getServices().englishWriting.listPictureFormats();
  return formats
    .filter((f) => f.status === "active")
    .map((f) => ({ categoryId: f.categoryId, formatId: f.id }));
}

export default async function PictureFormatPage({
  params,
}: PageProps<"/english-writing/[categoryId]/[formatId]">) {
  const { categoryId, formatId } = await params;
  const { englishWriting } = getServices();
  const format = await englishWriting.getPictureFormat(formatId);
  if (format?.categoryId !== categoryId || format.status !== "active") notFound();
  const category = await englishWriting.getCategory(categoryId);
  const lessons = await englishWriting.listLessons(formatId);

  return (
    <>
      <PageHeader
        back={{ href: englishRoutes.category(categoryId), label: category?.name ?? "Back" }}
        title={format.name}
      >
        <p className="text-lg text-muted">Choose a topic 揀題目</p>
      </PageHeader>
      <ul className="grid gap-3 sm:grid-cols-2">
        {lessons.map((l) => (
          <li key={l.id}>
            <NavCard href={englishRoutes.lesson(categoryId, formatId, l.id)} title={l.title} />
          </li>
        ))}
      </ul>
      {lessons.length === 0 && <p className="text-lg text-muted">No topics yet.</p>}
    </>
  );
}
