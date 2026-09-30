"use client";

import { useState } from "react";
import { Field, inputClass, parseTags } from "@/components/ui/form";
import type { LevelId, Vocabulary } from "@/domain/types";
import { useServiceQuery, useServices } from "@/hooks/useServiceQuery";
import { proofread } from "@/lib/proofread";
import { AdminRow, AdminToolbar, FilterSelect } from "./AdminList";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EditorDialog, errorMessage } from "./EditorDialog";
import { LinkPicker } from "./LinkPicker";

type Draft = Omit<Vocabulary, "id" | "tags"> & { id?: string; tagsText: string };

const JYUTPING = /^[a-z]+[1-6]( [a-z]+[1-6])*$/;

export function VocabularyManager() {
  const { vocabulary } = useServices();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Vocabulary | null>(null);

  const categories = useServiceQuery((s) => s.vocabulary.listCategories(), []);
  const list = useServiceQuery(
    (s) =>
      s.vocabulary.list({
        search,
        category: category || undefined,
        level: (level || undefined) as LevelId | undefined,
      }),
    [search, category, level],
  );
  if (!list || !categories) return <p className="text-muted">載入中…</p>;

  const set = (patch: Partial<Draft>) => {
    setError("");
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const save = async () => {
    if (!draft) return;
    const jyutping = draft.jyutping.trim().toLowerCase().replace(/\s+/g, " ");
    if (jyutping && !JYUTPING.test(jyutping)) {
      return setError("粵拼格式唔啱，例如「zi6 leot6」（每個字：字母＋聲調 1–6，用空格分隔）。可以留空。");
    }
    try {
      const { tagsText, ...rest } = draft;
      await vocabulary.save({ ...rest, jyutping, tags: parseTags(tagsText) });
      setDraft(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const issues = draft ? proofread(`${draft.definition}${draft.example}`) : [];

  return (
    <>
      <AdminToolbar
        title="詞語管理"
        count={list.length}
        search={search}
        onSearch={setSearch}
        onAdd={() => {
          setError("");
          setDraft({
            word: "",
            jyutping: "",
            pinyin: "",
            definition: "",
            example: "",
            category: category || "好詞",
            level: "B",
            tagsText: "",
            questionTypeIds: [],
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
          label="程度"
          value={level}
          onChange={setLevel}
          options={["C", "B", "A"].map((l) => ({ value: l, label: l }))}
        />
      </AdminToolbar>

      <ul className="space-y-2">
        {list.map((v) => (
          <AdminRow
            key={v.id}
            title={v.word}
            meta={[v.category, `程度 ${v.level}`, v.definition]}
            onEdit={() => {
              setError("");
              setDraft({ ...v, tagsText: v.tags.join("、") });
            }}
            onDelete={() => setDeleting(v)}
          />
        ))}
      </ul>
      {list.length === 0 && <p className="text-lg text-muted">搵唔到詞語。</p>}

      <EditorDialog
        open={!!draft}
        title={draft?.id ? "編輯詞語" : "新增詞語"}
        error={error}
        onSave={save}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="詞語">
                <input value={draft.word} onChange={(e) => set({ word: e.target.value })} className={inputClass} />
              </Field>
              <Field label="類別" hint="可以揀現有類別或者自己輸入">
                <input
                  list="vocab-categories"
                  value={draft.category}
                  onChange={(e) => set({ category: e.target.value })}
                  className={inputClass}
                />
                <datalist id="vocab-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="粵拼（可留空）" hint="例如：zi6 leot6">
                <input value={draft.jyutping} onChange={(e) => set({ jyutping: e.target.value })} className={inputClass} />
              </Field>
              <Field label="普通話拼音（可留空）" hint="例如：zì lǜ">
                <input value={draft.pinyin} onChange={(e) => set({ pinyin: e.target.value })} className={inputClass} />
              </Field>
              <Field label="程度">
                <select value={draft.level} onChange={(e) => set({ level: e.target.value as LevelId })} className={inputClass}>
                  <option value="C">C 基礎</option>
                  <option value="B">B 標準</option>
                  <option value="A">A 進階</option>
                </select>
              </Field>
              <Field label="標籤" hint="用「、」或者逗號分隔">
                <input value={draft.tagsText} onChange={(e) => set({ tagsText: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="解釋">
              <textarea
                value={draft.definition}
                onChange={(e) => set({ definition: e.target.value })}
                rows={2}
                className={inputClass}
              />
            </Field>
            <Field label="例句">
              <textarea
                value={draft.example}
                onChange={(e) => set({ example: e.target.value })}
                rows={2}
                className={inputClass}
              />
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
        itemName={deleting?.word ?? null}
        onConfirm={() => vocabulary.delete(deleting!.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
