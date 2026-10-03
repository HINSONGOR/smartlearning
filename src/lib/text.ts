/**
 * 計算字數（不計標點符號及空白），跟考試「不計標點符號」嘅計法。
 * 英文字母同數字每個字元計一個。
 */
export function countChars(text: string): number {
  return text.replace(/[\s\p{P}\p{S}]/gu, "").length;
}

/** 將範文 content 拆成段落（以空行分隔） */
export function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** 英文字數：以空白分隔嘅字 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}
