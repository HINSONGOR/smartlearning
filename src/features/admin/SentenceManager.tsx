"use client";

import { useState } from "react";
import { Field, inputClass, parseTags } from "@/components/ui/form";
import type { Sentence } from "@/domain/types";
import { useServiceQuery, useServices } from "@/hooks/useServiceQuery";
import { proofread } from "@/lib/proofread";
import { AdminRow, AdminToolbar, FilterSelect } from "./AdminList";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EditorDialog, errorMessage } from "./EditorDialog";

type Draft = Omit<Sentence, "id" | "tags"> & { id?: string; tagsText: string };

export function SentenceManager() {
  const { sentences } = useServices();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Sentence | null>(null);

  const categories = useServiceQuery((s) => s.sentences.listCategories(), []);
  const writingTypes = useServiceQuery(
    async (s) => (await s.curriculum.listWritingTypes()).filter((w) => w.status === "active"),
    [],
  );
  const list = useServiceQuery(
    (s) => s.sentences.list({ search, category: category || undefined }),
    [search, category],
  );
  if (!list || !categories || !writingTypes) return <p className="text-muted">載入中…</p>;

  const set = (patch: Partial<Draft>) => {
    setError("");
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const save = async () => {
    if (!draft) return;
    try {
      const { tagsText, ...rest } = draft;
      await sentences.save({ ...rest, tags: parseTags(tagsText) });
      setDraft(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const toggleWritingType = (id: string) =>
    draft &&
    set({
      writingTypeIds: draft.writingTypeIds.includes(id)
        ? draft.writingTypeIds.filter((x) => x !== id)
        : [...draft.writingTypeIds, id],
    });

  const issues = draft ? proofread(draft.text) : [];

  return (
    <>
      <AdminToolbar
        title="佳句管理"
        count={list.length}
        search={search}
        onSearch={setSearch}
        onAdd={() => {
          setError("");
          setDraft({ text: "", category: category || "", usage: "", tagsText: "", writingTypeIds: [] });
        }}
      >
        <FilterSelect
          label="類別"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </AdminToolbar>

      <ul className="space-y-2">
        {list.map((s) => (
          <AdminRow
            key={s.id}
            title={s.text}
            meta={[s.category, s.usage, ...s.tags].filter(Boolean)}
            onEdit={() => {
              setError("");
              setDraft({ ...s, tagsText: s.tags.join("、") });
            }}
            onDelete={() => setDeleting(s)}
          />
        ))}
      </ul>
      {list.length === 0 && <p className="text-lg text-muted">搵唔到佳句。</p>}

      <EditorDialog
        open={!!draft}
        title={draft?.id ? "編輯佳句" : "新增佳句"}
        error={error}
        onSave={save}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <>
            <Field label="佳句">
              <textarea
                value={draft.text}
                onChange={(e) => set({ text: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="類別" hint="例如：交代背景、描寫天氣、抒情結尾">
                <input
                  value={draft.category}
                  onChange={(e) => set({ category: e.target.value })}
                  list="sentence-categories"
                  className={inputClass}
                />
                <datalist id="sentence-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="適用場景" hint="例如：遊記、活動開頭">
                <input value={draft.usage} onChange={(e) => set({ usage: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="標籤" hint="用「、」或者逗號分隔">
              <input value={draft.tagsText} onChange={(e) => set({ tagsText: e.target.value })} className={inputClass} />
            </Field>
            <fieldset>
              <legend className="mb-2 font-medium">適用作文類型</legend>
              <div className="flex flex-wrap gap-2">
                {writingTypes.map((w) => (
                  <label key={w.id} className="flex h-11 items-center gap-2 rounded-xl bg-surface-2 px-3">
                    <input
                      type="checkbox"
                      checked={draft.writingTypeIds.includes(w.id)}
                      onChange={() => toggleWritingType(w.id)}
                    />
                    {w.name}
                  </label>
                ))}
              </div>
            </fieldset>
            {issues.length > 0 && (
              <p className="text-sm text-danger">
                用字提示：{issues.map((i) => `${i.text}（${i.kind}）`).join("、")}
              </p>
            )}
          </>
        )}
      </EditorDialog>

      <ConfirmDeleteDialog
        itemName={deleting?.text ?? null}
        onConfirm={() => sentences.delete(deleting!.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
