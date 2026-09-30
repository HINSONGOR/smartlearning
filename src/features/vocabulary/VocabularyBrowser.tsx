"use client";

import { useState } from "react";
import type { LevelId } from "@/domain/types";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { WordSheet } from "./WordSheet";

const levels: LevelId[] = ["C", "B", "A"];

export function VocabularyBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>();
  const [level, setLevel] = useState<LevelId>();
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useServiceQuery((s) => s.vocabulary.listCategories(), []);
  const words = useServiceQuery(
    (s) => s.vocabulary.list({ search, category, level }),
    [search, category, level],
  );
  const openWord = words?.find((w) => w.id === openId) ?? null;

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
          placeholder="搜尋詞語、解釋或例句"
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
        <div className="flex flex-wrap gap-2" role="group" aria-label="程度">
          <button type="button" className={chip(!level)} onClick={() => setLevel(undefined)}>
            所有程度
          </button>
          {levels.map((l) => (
            <button key={l} type="button" className={chip(level === l)} onClick={() => setLevel(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {words === undefined ? (
        <p className="text-muted">載入中…</p>
      ) : words.length === 0 ? (
        <p className="text-lg text-muted">搵唔到相關詞語。</p>
      ) : (
        <>
          <p className="mb-3 text-muted">共 {words.length} 個</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {words.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(w.id)}
                  className="flex h-full w-full flex-col items-start rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary hover:bg-primary-soft"
                >
                  <span className="text-2xl font-bold">{w.word}</span>
                  <span className="mt-1 line-clamp-2 text-sm text-muted">{w.definition}</span>
                  <span className="mt-2 text-xs text-muted">
                    {w.category}・{w.level}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <WordSheet word={openWord} onClose={() => setOpenId(null)} />
    </>
  );
}
