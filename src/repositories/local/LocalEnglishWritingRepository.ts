import type { EnglishWritingRepository } from "../interfaces";
import type { EnglishSeedData } from "./englishSeedData";

export class LocalEnglishWritingRepository implements EnglishWritingRepository {
  constructor(private readonly data: EnglishSeedData) {}

  async getCategories() {
    return this.data.categories;
  }
  async getPictureFormats() {
    return this.data.pictureFormats;
  }
  async getLessons() {
    return this.data.lessons;
  }
}
