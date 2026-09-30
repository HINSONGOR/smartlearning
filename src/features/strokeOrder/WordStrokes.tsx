"use client";

import { useState } from "react";
import { StrokeOrderPlayer } from "./StrokeOrderPlayer";

const hanChars = (word: string) => [...new Set([...word].filter((c) => /\p{Script=Han}/u.test(c)))];

/** ✍️ 一個詞語嘅筆順：詞語入面每個字都可以揀嚟睇 */
export function WordStrokes({ word }: { word: string }) {
  const chars = hanChars(word);
  const [selected, setSelected] = useState(chars[0]);
  if (!selected) return null;

  return (
    <div>
      {chars.length > 1 && (
        <div role="tablist" aria-label="揀字" className="mb-3 flex flex-wrap justify-center gap-2">
          {chars.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={selected === c}
              onClick={() => setSelected(c)}
              className={`h-12 w-12 rounded-2xl text-2xl ${
                selected === c ? "bg-primary text-on-primary" : "bg-surface-2"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <StrokeOrderPlayer key={selected} char={selected} />
      <p className="mt-3 text-center text-xs text-muted">
        筆順資料：Hanzi Writer／Make Me a Hanzi（Arphic Public License），字形同香港標準可能有少許出入
      </p>
    </div>
  );
}
