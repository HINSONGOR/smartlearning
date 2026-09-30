import type { LearningModule } from "@/domain/types";
import type { CurriculumRepository } from "@/repositories/interfaces";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** 科目、學習入口、作文類型、題型、題目（Phase 1 只讀） */
export class CurriculumService {
  constructor(private readonly repo: CurriculumRepository) {}

  async listSubjects() {
    return (await this.repo.getSubjects()).slice().sort(byOrder);
  }

  /** 首頁卡片：所有科目嘅學習入口，按 order 排 */
  async listHomeModules(): Promise<(LearningModule & { subjectId: string })[]> {
    const subjects = await this.repo.getSubjects();
    return subjects
      .flatMap((s) => s.modules.map((m) => ({ ...m, subjectId: s.id })))
      .sort(byOrder);
  }

  async getModule(moduleId: string) {
    return (await this.listHomeModules()).find((m) => m.id === moduleId);
  }

  async listLevels() {
    return (await this.repo.getLevels()).slice().sort(byOrder);
  }

  async listWritingTypes(moduleId: string) {
    return (await this.repo.getWritingTypes())
      .filter((w) => w.moduleId === moduleId)
      .sort(byOrder);
  }

  async getWritingType(id: string) {
    return (await this.repo.getWritingTypes()).find((w) => w.id === id);
  }

  async listQuestionTypes(writingTypeId?: string) {
    return (await this.repo.getQuestionTypes())
      .filter((q) => !writingTypeId || q.writingTypeId === writingTypeId)
      .sort(byOrder);
  }

  async getQuestionType(id: string) {
    return (await this.repo.getQuestionTypes()).find((q) => q.id === id);
  }

  async listTopics(questionTypeId?: string) {
    return (await this.repo.getTopics())
      .filter((t) => !questionTypeId || t.questionTypeId === questionTypeId)
      .sort(byOrder);
  }

  async getTopic(id: string) {
    return (await this.repo.getTopics()).find((t) => t.id === id);
  }
}
