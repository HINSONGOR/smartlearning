/**
 * 範文用字檢查：作文要用書面語同香港繁體字。
 * 只係捉常見錯處，唔能夠代替人手審閱。
 */

/** 粵語口語字（書面語唔應該出現） */
const CANTONESE = /[嘅咗唔啲嚟佢哋冇嗰噉喺嘢睇諗咩哂嚿嘥]|(?<!關)係(?!數)|點解|咁樣|而家/g;

/** 常見簡體字（繁體有另一個寫法） */
const SIMPLIFIED =
  /[这们说时会发经过还没对样让进么关学习书东车长门问题边给见头气开实现应该电脑网络环护节约饭饮视读写语词认识从众两个难热乐欢爱]/g;

/** 同一個字要統一寫法（跟用戶原稿） */
const VARIANTS: [RegExp, string][] = [
  [/裡/g, "裏"],
  [/綫/g, "線"],
];

export interface ProofreadIssue {
  kind: "口語" | "簡體字" | "異體字";
  text: string;
  suggestion?: string;
}

export function proofread(text: string): ProofreadIssue[] {
  const issues: ProofreadIssue[] = [];
  for (const m of text.matchAll(CANTONESE)) issues.push({ kind: "口語", text: m[0] });
  for (const m of text.matchAll(SIMPLIFIED)) issues.push({ kind: "簡體字", text: m[0] });
  for (const [re, suggestion] of VARIANTS) {
    for (const m of text.matchAll(re)) issues.push({ kind: "異體字", text: m[0], suggestion });
  }
  return issues;
}
