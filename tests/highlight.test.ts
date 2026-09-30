import { describe, expect, it } from "vitest";
import { vocabularySchema } from "@/domain/schemas";
import { buildTerms, highlight } from "@/lib/highlight";

const v = (id: string, word: string, category: string) =>
  vocabularySchema.parse({ id, word, definition: "x", category, level: "B" });

const terms = buildTerms([
  v("1", "總括而言", "連接詞"),
  v("2", "不但……還……", "連接詞"),
  v("3", "自律", "好詞"),
  v("4", "首先", "連接詞"),
]);

describe("highlight", () => {
  it("標示連接詞同詞語，其餘保持原文", () => {
    expect(highlight("首先，要自律。", terms)).toEqual([
      { kind: "connector", text: "首先", vocabId: "4" },
      { kind: "plain", text: "，要" },
      { kind: "word", text: "自律", vocabId: "3" },
      { kind: "plain", text: "。" },
    ]);
  });

  it("關聯詞只標示兩字或以上嘅部分", () => {
    const segs = highlight("不但可以，還可以", terms);
    expect(segs.filter((s) => s.kind !== "plain").map((s) => s.text)).toEqual(["不但"]);
  });

  it("拼返埋一齊等於原文", () => {
    const text = "總括而言，我們不但要自律，還要努力。";
    expect(highlight(text, terms).map((s) => s.text).join("")).toBe(text);
  });
});
