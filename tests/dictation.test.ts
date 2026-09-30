import { describe, expect, it } from "vitest";
import { vocabularySchema } from "@/domain/schemas";
import { buildDictation, isDictatable, shuffle } from "@/features/dictation/dictation";

const v = (id: string, word: string, category = "好詞", topicIds: string[] = []) =>
  vocabularySchema.parse({ id, word, definition: "x", category, level: "B", topicIds });

const words = [
  v("1", "自律", "好詞", ["self-discipline"]),
  v("2", "首先", "連接詞"),
  v("3", "不但……還……", "連接詞"),
  v("4", "珍惜", "好詞", ["cherish-life"]),
  v("5", "AI", "好詞"),
];

describe("默書", () => {
  it("關聯詞同非中文詞語唔會出現", () => {
    expect(isDictatable(words[2])).toBe(false);
    expect(isDictatable(words[4])).toBe(false);
    expect(buildDictation(words, {}).map((w) => w.word).sort()).toEqual(["珍惜", "自律", "首先"].sort());
  });

  it("可以按類別、題目篩選，同限制數量", () => {
    expect(buildDictation(words, { category: "連接詞" }).map((w) => w.word)).toEqual(["首先"]);
    expect(buildDictation(words, { topicIds: ["cherish-life"] }).map((w) => w.word)).toEqual(["珍惜"]);
    expect(buildDictation(words, { count: 2 })).toHaveLength(2);
  });

  it("洗牌唔會改動原本陣列，亦唔會多或者少", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffle(items, () => 0);
    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect(out.slice().sort()).toEqual(items);
  });
});
