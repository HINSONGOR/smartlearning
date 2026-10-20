"use client";

import { useSearchParams } from "next/navigation";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { DictationSession } from "./DictationSession";

/** 由網址 ?topic=xxx 決定默邊條題目嘅詞語（靜態網站要喺瀏覽器讀網址參數） */
export function DictationFromQuery() {
  const topicId = useSearchParams().get("topic") ?? undefined;
  // 有題目就攞同題目頁一樣嘅詞語（明確連結＋範文出現過嘅詞）
  const data = useServiceQuery(
    async (s) => {
      const topic = topicId ? await s.curriculum.getTopic(topicId) : undefined;
      if (!topic) return { topic: null, pool: undefined };
      const essays = await s.essays.listForTopic(topic.id);
      const pool = await s.vocabulary.listForTopic(
        topic.id,
        topic.questionTypeId,
        essays.map((e) => e.content),
      );
      return { topic, pool };
    },
    [topicId],
  );
  if (data === undefined) return <p className="text-muted">載入中…</p>;
  const { topic, pool } = data;

  return (
    <DictationSession
      key={topic?.id ?? "all"}
      pool={pool}
      topicTitle={topic?.title}
    />
  );
}
