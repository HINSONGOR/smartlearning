import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { routes } from "@/lib/routes";
import { TopicDetail } from "@/modules/writing/components/TopicDetail";
import { getServices } from "@/services/container";

export const dynamicParams = false;
export async function generateStaticParams() {
  const { curriculum } = getServices();
  const types = (await curriculum.listWritingTypes()).filter((w) => w.status === "active");
  const questionTypes = await curriculum.listQuestionTypes();
  const topics = await curriculum.listTopics();
  return topics.flatMap((t) => {
    const q = questionTypes.find((x) => x.id === t.questionTypeId);
    const w = q && types.find((x) => x.id === q.writingTypeId);
    return q && w ? [{ moduleId: w.moduleId, writingTypeId: w.id, questionTypeId: q.id, topicId: t.id }] : [];
  });
}

export default async function TopicPage({
  params,
}: PageProps<"/learn/[moduleId]/[writingTypeId]/[questionTypeId]/[topicId]">) {
  const { moduleId, writingTypeId, questionTypeId, topicId } = await params;
  const { curriculum } = getServices();
  const [writingType, questionType, topic, levels] = await Promise.all([
    curriculum.getWritingType(writingTypeId),
    curriculum.getQuestionType(questionTypeId),
    curriculum.getTopic(topicId),
    curriculum.listLevels(),
  ]);
  if (
    writingType?.moduleId !== moduleId ||
    questionType?.writingTypeId !== writingTypeId ||
    topic?.questionTypeId !== questionTypeId
  ) {
    notFound();
  }

  return (
    <>
      <PageHeader
        back={{
          href: routes.questionType(moduleId, writingTypeId, questionTypeId),
          label: questionType.name,
        }}
        eyebrow={`${writingType.name}・${questionType.name}`}
        title={topic.title}
      />
      <TopicDetail
        topic={topic}
        writingType={writingType}
        questionType={questionType}
        levels={levels}
      />
    </>
  );
}
