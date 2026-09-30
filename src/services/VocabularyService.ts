import type { LevelId, Vocabulary } from "@/domain/types";
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

  /** 題目頁用：直接關聯題目嘅詞語，加埋關聯題型嘅詞語 */
  async listForTopic(topicId: string, questionTypeId: string) {
    const all = await this.list();
    return all.filter(
      (v) => v.topicIds.includes(topicId) || v.questionTypeIds.includes(questionTypeId),
    );
  }

  async listCategories() {
    return [...new Set((await this.list()).map((v) => v.category))];
  }
}
