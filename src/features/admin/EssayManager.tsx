"use client";

import { useMemo, useState } from "react";
import { Field, inputClass, parseTags } from "@/components/ui/form";
import type { Essay, LevelId } from "@/domain/types";
import { useServiceQuery, useServices } from "@/hooks/useServiceQuery";
import { proofread } from "@/lib/proofread";
import { countChars, splitParagraphs } from "@/lib/text";
import { AdminRow, AdminToolbar, FilterSelect } from "./AdminList";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EditorDialog, errorMessage } from "./EditorDialog";

type Draft = Omit<Essay, "id" | "tags"> & { id?: string; tagsText: string };

const levels: LevelId[] = ["C", "B", "A"];

export function EssayManager() {
  const { essays } = useServices();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ subjectId: "", writingTypeId: "", questionTypeId: "", level: "" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Essay | null>(null);

  const curriculum = useServiceQuery(
    async (s) => ({
      subjects: await s.curriculum.listSubjects(),
      writingTypes: await s.curriculum.listWritingTypes(),
      questionTypes: await s.curriculum.listQuestionTypes(),
      topics: await s.curriculum.listTopics(),
    }),
    [],
  );
  const list = useServiceQuery(
    (s) =>
      s.essays.list({
        search,
        subjectId: filter.subjectId || undefined,
        writingTypeId: filter.writingTypeId || undefined,
        questionTypeId: filter.questionTypeId || undefined,
        level: (filter.level || undefined) as LevelId | undefined,
      }),
    [search, filter],
  );

  const names = useMemo(() => {
    const map = new Map<string, string>();
    curriculum?.subjects.forEach((s) => map.set(s.id, s.name));
    curriculum?.writingTypes.forEach((w) => map.set(w.id, w.name));
    curriculum?.questionTypes.forEach((q) => map.set(q.id, q.name));
    return map;
  }, [curriculum]);

  if (!curriculum || !list) return <p className="text-muted">載入中…</p>;

  /** 某科目有邊啲作文類型（經 subject.modules 對應） */
  const writingTypesOf = (subjectId: string) => {
    const moduleIds = curriculum.subjects.find((s) => s.id === subjectId)?.modules.map((m) => m.id) ?? [];
    return curriculum.writingTypes.filter((w) => moduleIds.includes(w.moduleId));
  };

  const newDraft = (): Draft => ({
    title: "",
    subjectId: curriculum.subjects[0]?.id ?? "",
    writingTypeId: writingTypesOf(curriculum.subjects[0]?.id ?? "")[0]?.id ?? "",
    questionTypeId: filter.questionTypeId || curriculum.questionTypes[0]?.id || "",
    topicId: undefined,
    level: "B",
    content: "",
    tagsText: "",
  });

  const save = async () => {
    if (!draft) return;
    try {
      const { tagsText, ...rest } = draft;
      await essays.save({ ...rest, tags: parseTags(tagsText) });
      setDraft(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const set = (patch: Partial<Draft>) => {
    setError("");
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };
  const qtOptions = curriculum.questionTypes.filter((q) => !draft || q.writingTypeId === draft.writingTypeId);
  const topicOptions = curriculum.topics.filter((t) => draft && t.questionTypeId === draft.questionTypeId);

  return (
    <>
      <AdminToolbar
        title="範文管理"
        count={list.length}
        search={search}
        onSearch={setSearch}
        onAdd={() => (setError(""), setDraft(newDraft()))}
      >
        <FilterSelect
          label="科目"
          value={filter.subjectId}
          onChange={(v) => setFilter({ ...filter, subjectId: v })}
          options={curriculum.subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
        <FilterSelect
          label="作文類型"
          value={filter.writingTypeId}
          onChange={(v) => setFilter({ ...filter, writingTypeId: v })}
          options={curriculum.writingTypes.map((w) => ({ value: w.id, label: w.name }))}
        />
        <FilterSelect
          label="題型"
          value={filter.questionTypeId}
          onChange={(v) => setFilter({ ...filter, questionTypeId: v })}
          options={curriculum.questionTypes.map((q) => ({ value: q.id, label: q.name }))}
        />
        <FilterSelect
          label="程度"
          value={filter.level}
          onChange={(v) => setFilter({ ...filter, level: v })}
          options={levels.map((l) => ({ value: l, label: l }))}
        />
      </AdminToolbar>

      <ul className="space-y-2">
        {list.map((e) => (
          <AdminRow
            key={e.id}
            title={`${e.title}（${e.level}）`}
            meta={[
              names.get(e.questionTypeId) ?? "",
              `${countChars(e.content)} 字`,
              ...e.tags,
            ]}
            onEdit={() => {
              setError("");
              setDraft({ ...e, tagsText: e.tags.join("、") });
            }}
            onDelete={() => setDeleting(e)}
          />
        ))}
      </ul>
      {list.length === 0 && <p className="text-lg text-muted">搵唔到範文。</p>}

      <EditorDialog
        open={!!draft}
        title={draft?.id ? "編輯範文" : "新增範文"}
        error={error}
        onSave={save}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="科目">
                <select
                  value={draft.subjectId}
                  onChange={(e) => {
                    const subjectId = e.target.value;
                    const writingTypeId = writingTypesOf(subjectId)[0]?.id ?? "";
                    const firstQt = curriculum.questionTypes.find((q) => q.writingTypeId === writingTypeId);
                    set({ subjectId, writingTypeId, questionTypeId: firstQt?.id ?? "", topicId: undefined });
                  }}
                  className={inputClass}
                >
                  {curriculum.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="作文類型">
                <select
                  value={draft.writingTypeId}
                  onChange={(e) => {
                    const writingTypeId = e.target.value;
                    const firstQt = curriculum.questionTypes.find((q) => q.writingTypeId === writingTypeId);
                    set({ writingTypeId, questionTypeId: firstQt?.id ?? "", topicId: undefined });
                  }}
                  className={inputClass}
                >
                  {writingTypesOf(draft.subjectId).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="題型">
                <select
                  value={draft.questionTypeId}
                  onChange={(e) => set({ questionTypeId: e.target.value, topicId: undefined })}
                  className={inputClass}
                >
                  {qtOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="程度">
                <select
                  value={draft.level}
                  onChange={(e) => set({ level: e.target.value as LevelId })}
                  className={inputClass}
                >
                  <option value="C">C 基礎</option>
                  <option value="B">B 標準</option>
                  <option value="A">A 進階</option>
                </select>
              </Field>
            </div>
            <Field label="題目" hint="揀咗題目，範文就會喺嗰條題目嘅範文步驟出現">
              <select
                value={draft.topicId ?? ""}
                onChange={(e) => {
                  const topic = topicOptions.find((t) => t.id === e.target.value);
                  set({ topicId: topic?.id, title: draft.title || topic?.title || "" });
                }}
                className={inputClass}
              >
                <option value="">（不指定題目）</option>
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="標題">
              <input value={draft.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
            </Field>
            <ContentField value={draft.content} onChange={(content) => set({ content })} />
            <Field label="標籤" hint="用「、」或者逗號分隔，例如：原稿、環保">
              <input value={draft.tagsText} onChange={(e) => set({ tagsText: e.target.value })} className={inputClass} />
            </Field>
          </>
        )}
      </EditorDialog>

      <ConfirmDeleteDialog
        itemName={deleting ? `${deleting.title}（${deleting.level}）` : null}
        onConfirm={() => essays.delete(deleting!.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

function ContentField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const issues = proofread(value);
  const paragraphs = splitParagraphs(value).length;
  return (
    <Field label="內容" hint="段落之間空一行。第 1 段會對應公式第 1 段，如此類推。">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className={`${inputClass} leading-loose`}
      />
      <span className="flex flex-wrap gap-3 text-sm">
        <span className={countChars(value) >= 300 ? "text-success" : "text-muted"}>
          {countChars(value)} 字（不計標點）
        </span>
        <span className={paragraphs === 4 ? "text-success" : "text-muted"}>{paragraphs} 段</span>
        {issues.length > 0 && (
          <span className="text-danger">
            用字提示：{issues.map((i) => `${i.text}（${i.kind}${i.suggestion ? `→${i.suggestion}` : ""}）`).join("、")}
          </span>
        )}
      </span>
    </Field>
  );
}
