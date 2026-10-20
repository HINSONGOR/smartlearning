import type { LevelId, Vocabulary } from "@/domain/types";
import { appearsIn } from "@/lib/highlight";
import { ContentService, matchesSearch } from "./ContentService";

export interface VocabularyFilter {
  category?: string;
  level?: LevelId;
  topicId?: string;
  questionTypeId?: string;
  search?: string;
}

export class VocabularyService extends ContentService<Vocabulary, VocabularyFilter> {
  protected matches(v: Vocabulary, f: VocabularyFilter) {
    return (
      (!f.category || v.category === f.category) &&
      (!f.level || v.level === f.level) &&
      (!f.topicId || v.topicIds.includes(f.topicId)) &&
      (!f.questionTypeId || v.questionTypeIds.includes(f.questionTypeId)) &&
      matchesSearch([v.word, v.definition, v.example, v.category, ...v.tags], f.search ?? "")
    );
  }

  /**
   * 題目頁用嘅詞語：
   * - 明確連到呢條題目嘅詞語
   * - 喺呢條題目範文入面出現過嘅詞語
   * - 冇指定題目、只連到題型／分類嘅通用詞語（例如描寫天氣、交代背景）
   * 咁就唔會將其他題目嘅詞語（例如「靦腆」）放錯入嚟。
   */
  async listForTopic(topicId: string, questionTypeId: string, essayTexts: string[] = []) {
    const text = essayTexts.join("\n");
    return (await this.list()).filter(
      (v) =>
        v.topicIds.includes(topicId) ||
        appearsIn(v.word, text) ||
        (v.topicIds.length === 0 && v.questionTypeIds.includes(questionTypeId)),
    );
  }

  async listCategories() {
    return [...new Set((await this.list()).map((v) => v.category))];
  }
}
