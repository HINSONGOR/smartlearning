import type { Sentence } from "@/domain/types";
import { ContentService, matchesSearch } from "./ContentService";

export interface SentenceFilter {
  category?: string;
  writingTypeId?: string;
  search?: string;
}

export class SentenceService extends ContentService<Sentence, SentenceFilter> {
  protected matches(s: Sentence, f: SentenceFilter) {
    return (
      (!f.category || s.category === f.category) &&
      (!f.writingTypeId || s.writingTypeIds.includes(f.writingTypeId)) &&
      matchesSearch([s.text, s.category, s.usage, ...s.tags], f.search ?? "")
    );
  }

  async listCategories() {
    return [...new Set((await this.list()).map((s) => s.category))];
  }
}
