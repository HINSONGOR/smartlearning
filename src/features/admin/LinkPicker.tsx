"use client";

import { useServiceQuery } from "@/hooks/useServiceQuery";

interface Props {
  questionTypeIds: string[];
  topicIds: string[];
  onChange: (value: { questionTypeIds: string[]; topicIds: string[] }) => void;
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

/** 揀關聯題型同題目：決定詞語／例子會喺邊啲題目頁出現 */
export function LinkPicker({ questionTypeIds, topicIds, onChange }: Props) {
  const data = useServiceQuery(
    async (s) => ({
      questionTypes: await s.curriculum.listQuestionTypes(),
      topics: await s.curriculum.listTopics(),
    }),
    [],
  );
  if (!data) return null;

  return (
    <div className="space-y-3">
      <p className="font-bold">關聯題型（會喺呢個題型所有題目出現）</p>
      <div className="flex flex-wrap gap-2">
        {data.questionTypes.map((q) => (
          <label
            key={q.id}
            className={`flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-3 ${
              questionTypeIds.includes(q.id) ? "border-primary bg-primary-soft" : "border-border"
            }`}
          >
            <input
              type="checkbox"
              checked={questionTypeIds.includes(q.id)}
              onChange={() => onChange({ questionTypeIds: toggle(questionTypeIds, q.id), topicIds })}
              className="h-5 w-5"
            />
            {q.name}
          </label>
        ))}
      </div>
      <p className="font-bold">關聯題目（已揀 {topicIds.length} 條）</p>
      {data.questionTypes.map((q) => {
        const topics = data.topics.filter((t) => t.questionTypeId === q.id);
        if (!topics.length) return null;
        const selected = topics.filter((t) => topicIds.includes(t.id)).length;
        return (
          <details key={q.id} className="rounded-2xl bg-surface px-3 py-2" open={selected > 0}>
            <summary className="cursor-pointer py-1 font-medium">
              {q.name}（{selected}／{topics.length}）
            </summary>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {topics.map((t) => (
                <label key={t.id} className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={topicIds.includes(t.id)}
                    onChange={() => onChange({ questionTypeIds, topicIds: toggle(topicIds, t.id) })}
                    className="h-5 w-5 shrink-0"
                  />
                  {t.title}
                </label>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
