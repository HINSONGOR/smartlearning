import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { routes } from "@/lib/routes";
import { TopicDetail } from "@/modules/writing/components/TopicDetail";
import { getServices } from "@/services/container";

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
