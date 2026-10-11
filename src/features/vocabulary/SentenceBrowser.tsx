"use client";

import { useState } from "react";
import { SpeakButton } from "@/features/speech/SpeakButton";
import { useServiceQuery } from "@/hooks/useServiceQuery";

/** 佳句庫：按類別睇好句子，可以聽讀音 */
export function SentenceBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>();

  const categories = useServiceQuery((s) => s.sentences.listCategories(), []);
  const sentences = useServiceQuery((s) => s.sentences.list({ search, category }), [search, category]);

  const chip = (active: boolean) =>
    `h-11 rounded-2xl px-4 font-medium transition ${
      active ? "bg-primary text-on-primary" : "bg-surface text-muted hover:text-text"
    }`;

  return (
    <>
      <div className="mb-6 space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋佳句或場景"
          className="h-14 w-full rounded-2xl border border-border bg-surface px-4 text-lg outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="類別">
          <button type="button" className={chip(!category)} onClick={() => setCategory(undefined)}>
            全部
          </button>
          {categories?.map((c) => (
            <button key={c} type="button" className={chip(category === c)} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {sentences === undefined ? (
        <p className="text-muted">載入中…</p>
      ) : sentences.length === 0 ? (
        <p className="text-lg text-muted">搵唔到相關佳句。</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sentences.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
              <p className="text-lg leading-loose md:text-xl">{s.text}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-sm text-primary">{s.category}</span>
                {s.usage && <span className="text-sm text-muted">適用：{s.usage}</span>}
                <span className="flex-1" />
                <SpeakButton text={s.text} lang="yue" compact />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
