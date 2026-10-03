import type { EnglishCategory, EnglishWritingLesson, PictureFormat } from "@/domain/english";
import type {
  Essay,
  Example,
  Level,
  QuestionType,
  Subject,
  Topic,
  Vocabulary,
  WritingType,
} from "@/domain/types";

/**
 * Repository interface：Service 只依賴呢度，唔知資料實際放喺邊。
 * Phase 1 用 local 實作（/data JSON + localStorage），
 * 將來可以換成 Supabase、Firebase 等，只需要喺 services/container.ts 換實作。
 * 全部方法都係 async，方便將來接駁網絡資料來源。
 */

/** 科目、作文類型、題型、題目：Phase 1 只讀 */
export interface CurriculumRepository {
  getSubjects(): Promise<Subject[]>;
  getLevels(): Promise<Level[]>;
  getWritingTypes(): Promise<WritingType[]>;
  getQuestionTypes(): Promise<QuestionType[]>;
  getTopics(): Promise<Topic[]>;
}

/** 可以新增、編輯、刪除嘅資料 */
export interface CrudRepository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  save(item: T): Promise<T>;
  delete(id: string): Promise<void>;
}

export type EssayRepository = CrudRepository<Essay>;
export type VocabularyRepository = CrudRepository<Vocabulary>;
export type ExampleRepository = CrudRepository<Example>;

/** 英文作文：類別、圖片格式、題目（目前只讀） */
export interface EnglishWritingRepository {
  getCategories(): Promise<EnglishCategory[]>;
  getPictureFormats(): Promise<PictureFormat[]>;
  getLessons(): Promise<EnglishWritingLesson[]>;
}
