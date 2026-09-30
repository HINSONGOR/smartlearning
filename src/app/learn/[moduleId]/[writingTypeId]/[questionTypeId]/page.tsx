import { notFound } from "next/navigation";
import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { routes } from "@/lib/routes";
import { FormulaCards } from "@/modules/writing/components/FormulaCards";
import { getServices } from "@/services/container";

export default async function QuestionTypePage({
  params,
}: PageProps<"/learn/[moduleId]/[writingTypeId]/[questionTypeId]">) {
  const { moduleId, writingTypeId, questionTypeId } = await params;
  const { curriculum } = getServices();
  const [writingType, questionType] = await Promise.all([
    curriculum.getWritingType(writingTypeId),
    curriculum.getQuestionType(questionTypeId),
  ]);
  if (
    writingType?.moduleId !== moduleId ||
    questionType?.writingTypeId !== writingTypeId
  ) {
    notFound();
  }
  const topics = await curriculum.listTopics(questionTypeId);

  return (
    <>
      <PageHeader
        back={{ href: routes.writingType(moduleId, writingTypeId), label: writingType.name }}
        eyebrow={writingType.name}
        title={questionType.name}
      >
        {questionType.mnemonic && (
          <p className="inline-block rounded-xl bg-primary px-3 py-1 text-lg font-bold text-on-primary">
            口訣：{questionType.mnemonic}
          </p>
        )}
        <p className="text-lg">{questionType.description}</p>
      </PageHeader>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-bold">第三步：揀題目</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((t) => (
            <li key={t.id}>
              <NavCard
                href={routes.topic(moduleId, writingTypeId, questionTypeId, t.id)}
                title={t.title}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-bold">寫作公式</h2>
        <p className="rounded-2xl bg-surface-2 p-4 text-lg font-medium">{questionType.formula}</p>
        <FormulaCards structure={questionType.structure} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-bold">寫作思路</h2>
        <ol className="space-y-2">
          {questionType.thinkingSteps.map((step, i) => (
            <li key={step} className="flex gap-3 rounded-2xl bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                {i + 1}
              </span>
              <span className="text-lg">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {questionType.ideaBank.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-bold">常用論點（揀兩個就得）</h2>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {questionType.ideaBank.map((idea) => (
              <li key={idea.point} className="rounded-2xl border border-border bg-surface p-3">
                <p className="text-lg font-bold">{idea.point}</p>
                {idea.usage && <p className="text-sm text-muted">{idea.usage}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
