import type { Vocabulary } from "@/domain/types";

export type Segment =
  | { kind: "plain"; text: string }
  | { kind: "connector" | "word"; text: string; vocabId: string };

interface Term {
  text: string;
  kind: "connector" | "word";
  vocabId: string;
}

/** 詞語用嚟配對嘅部分：「不但……還……」只取「不但」，單字部分唔用 */
export function wordParts(word: string): string[] {
  return word.split(/…+/).filter((p) => p.length >= 2);
}

/** 詞語有冇喺文章出現（關聯詞要每個部分都出現） */
export function appearsIn(word: string, text: string): boolean {
  const parts = wordParts(word);
  return parts.length > 0 && parts.every((p) => text.includes(p));
}

/**
 * 由詞語庫砌出要標示嘅字詞：
 * - 連接詞：「不但……還……」會拆做「不但」，單字部分（例如「還」）唔標，避免標錯
 * - 其他詞語：成個詞標示，撳落去可以睇詞語卡
 */
export function buildTerms(vocabulary: Vocabulary[]): Term[] {
  const terms: Term[] = [];
  for (const v of vocabulary) {
    const kind = v.category === "連接詞" ? "connector" : "word";
    const parts = wordParts(v.word);
    for (const text of parts) terms.push({ text, kind, vocabId: v.id });
  }
  // 長嘅詞優先，例如「總括而言」先過「而言」
  return terms.sort((a, b) => b.text.length - a.text.length);
}

export function highlight(text: string, terms: Term[]): Segment[] {
  const segments: Segment[] = [];
  let plain = "";
  let i = 0;
  while (i < text.length) {
    const term = terms.find((t) => text.startsWith(t.text, i));
    if (term) {
      if (plain) segments.push({ kind: "plain", text: plain });
      plain = "";
      segments.push({ kind: term.kind, text: term.text, vocabId: term.vocabId });
      i += term.text.length;
    } else {
      plain += text[i];
      i++;
    }
  }
  if (plain) segments.push({ kind: "plain", text: plain });
  return segments;
}
