import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { englishRoutes } from "@/lib/routes";
import { LessonView } from "@/modules/english/components/LessonView";
import { getServices } from "@/services/container";

export const dynamicParams = false;
export async function generateStaticParams() {
  const { englishWriting } = getServices();
  const formats = (await englishWriting.listPictureFormats()).filter((f) => f.status === "active");
  const lessons = await englishWriting.listLessons();
  return lessons.flatMap((l) => {
    const f = formats.find((x) => x.id === l.pictureFormat);
    return f ? [{ categoryId: f.categoryId, formatId: f.id, lessonId: l.id }] : [];
  });
}

export default async function EnglishLessonPage({
  params,
}: PageProps<"/english-writing/[categoryId]/[formatId]/[lessonId]">) {
  const { categoryId, formatId, lessonId } = await params;
  const { englishWriting } = getServices();
  const [format, lesson] = await Promise.all([
    englishWriting.getPictureFormat(formatId),
    englishWriting.getLesson(lessonId),
  ]);
  if (format?.categoryId !== categoryId || lesson?.pictureFormat !== formatId) notFound();
  const formula = await englishWriting.getWritingFormula(lesson);

  return (
    <>
      <PageHeader
        back={{ href: englishRoutes.format(categoryId, formatId), label: format.name }}
        eyebrow={`English Writing・${format.name}`}
        title={lesson.title}
      />
      <LessonView lesson={{ ...lesson, sampleEssays: englishWriting.sortSamples(lesson) }} formula={formula} />
    </>
  );
}
