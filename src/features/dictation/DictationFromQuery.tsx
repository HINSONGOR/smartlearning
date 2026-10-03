"use client";

import { useSearchParams } from "next/navigation";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { DictationSession } from "./DictationSession";

/** 由網址 ?topic=xxx 決定默邊條題目嘅詞語（靜態網站要喺瀏覽器讀網址參數） */
export function DictationFromQuery() {
  const topicId = useSearchParams().get("topic") ?? undefined;
  const topic = useServiceQuery(
    (s) => (topicId ? s.curriculum.getTopic(topicId) : Promise.resolve(null)),
    [topicId],
  );
  if (topic === undefined) return <p className="text-muted">載入中…</p>;

  return (
    <DictationSession
      key={topic?.id ?? "all"}
      topicIds={topic ? [topic.id] : undefined}
      topicTitle={topic?.title}
    />
  );
}
