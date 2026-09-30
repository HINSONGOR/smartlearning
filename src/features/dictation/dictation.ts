import type { Vocabulary } from "@/domain/types";

export interface DictationOptions {
  category?: string;
  topicIds?: string[];
  /** 無填就默全部 */
  count?: number;
}

/** 可以默嘅詞語：「不但……還……」呢類關聯詞唔適合默書，剔走 */
export function isDictatable(v: Vocabulary) {
  return !v.word.includes("…") && /^\p{Script=Han}+$/u.test(v.word);
}

/** 洗牌（Fisher–Yates），rng 可以換做固定值方便測試 */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDictation(
  vocabulary: Vocabulary[],
  { category, topicIds, count }: DictationOptions,
  rng?: () => number,
): Vocabulary[] {
  const pool = vocabulary.filter(
    (v) =>
      isDictatable(v) &&
      (!category || v.category === category) &&
      (!topicIds?.length || v.topicIds.some((id) => topicIds.includes(id))),
  );
  const shuffled = shuffle(pool, rng);
  return count ? shuffled.slice(0, count) : shuffled;
}
