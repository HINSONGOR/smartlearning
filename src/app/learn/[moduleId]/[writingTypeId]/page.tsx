import { notFound } from "next/navigation";
import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { routes } from "@/lib/routes";
import { getServices } from "@/services/container";

export const dynamicParams = false;
export async function generateStaticParams() {
  const { curriculum } = getServices();
  const modules = (await curriculum.listHomeModules()).filter((m) => m.status === "active");
  const types = await curriculum.listWritingTypes();
  return types
    .filter((w) => w.status === "active" && modules.some((m) => m.id === w.moduleId))
    .map((w) => ({ moduleId: w.moduleId, writingTypeId: w.id }));
}

export default async function WritingTypePage({
  params,
}: PageProps<"/learn/[moduleId]/[writingTypeId]">) {
  const { moduleId, writingTypeId } = await params;
  const { curriculum } = getServices();
  const [learningModule, writingType] = await Promise.all([
    curriculum.getModule(moduleId),
    curriculum.getWritingType(writingTypeId),
  ]);
  if (!learningModule || writingType?.moduleId !== moduleId || writingType.status !== "active") {
    notFound();
  }
  const questionTypes = await curriculum.listQuestionTypes(writingTypeId);

  return (
    <>
      <PageHeader
        back={{ href: routes.module(moduleId), label: learningModule.name }}
        title={writingType.name}
      >
        <p className="text-lg text-muted">第二步：揀題型</p>
        {writingType.requirements && (
          <p className="inline-flex flex-wrap gap-2">
            <span className="rounded-xl bg-accent-soft px-3 py-1 text-accent">
              最少 {writingType.requirements.minChars} 字（不計標點）
            </span>
            <span className="rounded-xl bg-accent-soft px-3 py-1 text-accent">
              限時 {writingType.requirements.timeLimitMinutes} 分鐘
            </span>
          </p>
        )}
      </PageHeader>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questionTypes.map((q) => (
          <li key={q.id}>
            <NavCard
              href={routes.questionType(moduleId, writingTypeId, q.id)}
              title={q.name}
              badge={q.isPlaceholder ? "待補充" : q.mnemonic || undefined}
              subtitle={q.formula}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
