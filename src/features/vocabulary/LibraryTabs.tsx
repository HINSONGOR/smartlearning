"use client";

import { useState } from "react";
import { SentenceBrowser } from "./SentenceBrowser";
import { VocabularyBrowser } from "./VocabularyBrowser";

const tabs = [
  { id: "words", label: "🔤 詞語" },
  { id: "sentences", label: "✨ 佳句" },
] as const;

/** 詞語庫頁：詞語／佳句兩個分頁 */
export function LibraryTabs() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("words");
  return (
    <>
      <div role="tablist" aria-label="詞語庫分頁" className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-12 rounded-2xl px-5 text-lg font-bold transition ${
              tab === t.id ? "bg-primary text-on-primary" : "bg-surface text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "words" ? <VocabularyBrowser /> : <SentenceBrowser />}
    </>
  );
}
