import { PageHeader } from "@/components/ui/PageHeader";
import { DictationSession } from "@/features/dictation/DictationSession";
import { getServices } from "@/services/container";

export default async function DictationPage({ searchParams }: PageProps<"/dictation">) {
  const { topic } = await searchParams;
  const topicId = typeof topic === "string" ? topic : undefined;
  const found = topicId ? await getServices().curriculum.getTopic(topicId) : undefined;

  return (
    <>
      <PageHeader back={{ href: "/vocabulary", label: "詞語庫" }} title="✏️ 默書">
        <p className="text-lg text-muted">聽讀音、寫詞語，寫完即刻睇筆順</p>
      </PageHeader>
      <DictationSession
        key={found?.id ?? "all"}
        topicIds={found ? [found.id] : undefined}
        topicTitle={found?.title}
      />
    </>
  );
}
