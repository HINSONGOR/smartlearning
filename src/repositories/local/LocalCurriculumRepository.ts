import type { CurriculumRepository } from "../interfaces";
import type { SeedData } from "./seedData";

export class LocalCurriculumRepository implements CurriculumRepository {
  constructor(private readonly data: SeedData) {}

  async getSubjects() {
    return this.data.subjects;
  }
  async getLevels() {
    return this.data.levels;
  }
  async getWritingTypes() {
    return this.data.writingTypes;
  }
  async getQuestionTypes() {
    return this.data.questionTypes;
  }
  async getTopics() {
    return this.data.topics;
  }
}
