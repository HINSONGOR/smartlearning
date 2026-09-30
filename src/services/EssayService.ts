import type { Essay, LevelId } from "@/domain/types";
import { ContentService, matchesSearch } from "./ContentService";

export interface EssayFilter {
  subjectId?: string;
  writingTypeId?: string;
  questionTypeId?: string;
  topicId?: string;
  level?: LevelId;
  search?: string;
}

const levelOrder: Record<LevelId, number> = { C: 0, B: 1, A: 2 };

export class EssayService extends ContentService<Essay, EssayFilter> {
  protected matches(e: Essay, f: EssayFilter) {
    return (
      (!f.subjectId || e.subjectId === f.subjectId) &&
      (!f.writingTypeId || e.writingTypeId === f.writingTypeId) &&
      (!f.questionTypeId || e.questionTypeId === f.questionTypeId) &&
      (!f.topicId || e.topicId === f.topicId) &&
      (!f.level || e.level === f.level) &&
      matchesSearch([e.title, e.content, ...e.tags], f.search ?? "")
    );
  }

  /** 某題目嘅範文，按 C → B → A 排 */
  async listForTopic(topicId: string) {
    return (await this.list({ topicId })).sort(
      (a, b) => levelOrder[a.level] - levelOrder[b.level],
    );
  }
}
