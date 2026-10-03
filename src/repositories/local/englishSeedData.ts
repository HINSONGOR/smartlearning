import { z } from "zod";
import { englishCategorySchema, englishLessonSchema, pictureFormatSchema } from "@/domain/english";
import categoriesJson from "@data/english/categories.json";
import lessonsJson from "@data/english/lessons.json";
import pictureFormatsJson from "@data/english/pictureFormats.json";

function load<T extends z.ZodType>(file: string, schema: T, raw: unknown) {
  const result = z.array(schema).safeParse(raw);
  if (!result.success) {
    throw new Error(`data/english/${file} 格式錯誤：\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** 讀取 data/english 入面嘅 JSON，並用 schema 驗證 */
export const englishSeedData = {
  categories: load("categories.json", englishCategorySchema, categoriesJson),
  pictureFormats: load("pictureFormats.json", pictureFormatSchema, pictureFormatsJson),
  lessons: load("lessons.json", englishLessonSchema, lessonsJson),
};

export type EnglishSeedData = typeof englishSeedData;
