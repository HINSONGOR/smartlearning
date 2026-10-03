import type { EnglishWritingLesson, SampleLevel } from "@/domain/english";
import type { EnglishWritingRepository } from "@/repositories/interfaces";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const sampleOrder: Record<SampleLevel, number> = { C: 0, B: 1, A: 2 };

/** 英文作文：English Writing → 類別 → 圖片格式 → 題目 */
export class EnglishWritingService {
  constructor(private readonly repo: EnglishWritingRepository) {}

  async listCategories() {
    return (await this.repo.getCategories()).slice().sort(byOrder);
  }

  async getCategory(id: string) {
    return (await this.repo.getCategories()).find((c) => c.id === id);
  }

  async listPictureFormats(categoryId?: string) {
    return (await this.repo.getPictureFormats())
      .filter((f) => !categoryId || f.categoryId === categoryId)
      .sort(byOrder);
  }

  async getPictureFormat(id: string) {
    return (await this.repo.getPictureFormats()).find((f) => f.id === id);
  }

  async listLessons(formatId?: string) {
    return (await this.repo.getLessons())
      .filter((l) => !formatId || l.pictureFormat === formatId)
      .sort(byOrder);
  }

  async getLesson(id: string) {
    return (await this.repo.getLessons()).find((l) => l.id === id);
  }

  /** 題目有自己嘅寫作公式就用，否則用圖片格式嘅預設公式 */
  async getWritingFormula(lesson: EnglishWritingLesson) {
    return lesson.writingFormula ?? (await this.getPictureFormat(lesson.pictureFormat))?.writingFormula;
  }

  /** 範文按 C → B → A 排 */
  sortSamples(lesson: EnglishWritingLesson) {
    return lesson.sampleEssays.slice().sort((a, b) => sampleOrder[a.level] - sampleOrder[b.level]);
  }
}
