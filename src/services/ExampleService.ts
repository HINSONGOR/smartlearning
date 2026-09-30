import type { Example, ExampleCategory } from "@/domain/types";
import { ContentService, matchesSearch } from "./ContentService";

export interface ExampleFilter {
  category?: ExampleCategory;
  topicId?: string;
  questionTypeId?: string;
  search?: string;
}

export class ExampleService extends ContentService<Example, ExampleFilter> {
  protected matches(e: Example, f: ExampleFilter) {
    return (
      (!f.category || e.category === f.category) &&
      (!f.topicId || e.topicIds.includes(f.topicId)) &&
      (!f.questionTypeId || e.questionTypeIds.includes(f.questionTypeId)) &&
      matchesSearch([e.title, e.content, e.category, ...e.tags], f.search ?? "")
    );
  }

  /** 題目頁用：只顯示直接關聯呢條題目嘅例子 */
  listForTopic(topicId: string) {
    return this.list({ topicId });
  }
}
