"use client";

import { useState } from "react";
import { Field, inputClass, parseTags } from "@/components/ui/form";
import { exampleCategorySchema } from "@/domain/schemas";
import type { Example, ExampleCategory } from "@/domain/types";
import { useServiceQuery, useServices } from "@/hooks/useServiceQuery";
import { proofread } from "@/lib/proofread";
import { AdminRow, AdminToolbar, FilterSelect } from "./AdminList";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EditorDialog, errorMessage } from "./EditorDialog";
import { LinkPicker } from "./LinkPicker";

type Draft = Omit<Example, "id" | "tags"> & { id?: string; tagsText: string };

const categories = exampleCategorySchema.options;

export function ExampleManager() {
  const { examples } = useServices();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [questionTypeId, setQuestionTypeId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Example | null>(null);

  const questionTypes = useServiceQuery((s) => s.curriculum.listQuestionTypes(), []);
  const list = useServiceQuery(
    (s) =>
      s.examples.list({
        search,
        category: (category || undefined) as ExampleCategory | undefined,
        questionTypeId: questionTypeId || undefined,
      }),
    [search, category, questionTypeId],
  );
  if (!list || !questionTypes) return <p className="text-muted">載入中…</p>;

  const set = (patch: Partial<Draft>) => {
    setError("");
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const save = async () => {
    if (!draft) return;
    try {
      const { tagsText, ...rest } = draft;
      await examples.save({ ...rest, tags: parseTags(tagsText) });
      setDraft(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const issues = draft ? proofread(`${draft.title}${draft.content}`) : [];

  return (
    <>
      <AdminToolbar
        title="例子管理"
        count={list.length}
        search={search}
        onSearch={setSearch}
        onAdd={() => {
          setError("");
          setDraft({
            title: "",
            content: "",
            category: (category as ExampleCategory) || "生活",
            tagsText: "",
            questionTypeIds: questionTypeId ? [questionTypeId] : [],
            topicIds: [],
          });
        }}
      >
        <FilterSelect
          label="類別"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="題型"
          value={questionTypeId}
          onChange={setQuestionTypeId}
          options={questionTypes.map((q) => ({ value: q.id, label: q.name }))}
        />
      </AdminToolbar>

      <ul className="space-y-2">
        {list.map((ex) => (
          <AdminRow
            key={ex.id}
            title={ex.title}
            meta={[ex.category, `${ex.topicIds.length} 條題目`, ...ex.tags]}
            onEdit={() => {
              setError("");
              setDraft({ ...ex, tagsText: ex.tags.join("、") });
            }}
            onDelete={() => setDeleting(ex)}
          />
        ))}
      </ul>
      {list.length === 0 && <p className="text-lg text-muted">搵唔到例子。</p>}

      <EditorDialog
        open={!!draft}
        title={draft?.id ? "編輯例子" : "新增例子"}
        error={error}
        onSave={save}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="標題">
                <input value={draft.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="類別">
                <select
                  value={draft.category}
                  onChange={(e) => set({ category: e.target.value as ExampleCategory })}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="內容">
              <textarea
                value={draft.content}
                onChange={(e) => set({ content: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </Field>
            <Field label="標籤" hint="用「、」或者逗號分隔">
              <input value={draft.tagsText} onChange={(e) => set({ tagsText: e.target.value })} className={inputClass} />
            </Field>
            {issues.length > 0 && (
              <p className="text-sm text-danger">
                用字提示：{issues.map((i) => `${i.text}（${i.kind}）`).join("、")}
              </p>
            )}
            <LinkPicker
              questionTypeIds={draft.questionTypeIds}
              topicIds={draft.topicIds}
              onChange={(links) => set(links)}
            />
          </>
        )}
      </EditorDialog>

      <ConfirmDeleteDialog
        itemName={deleting?.title ?? null}
        onConfirm={() => examples.delete(deleting!.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
