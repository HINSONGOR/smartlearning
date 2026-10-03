import { z } from "zod";

/**
 * 英文作文資料格式。
 * 層級：English Writing → 類別（Picture Writing）→ 圖片格式（4-Panel）→ 題目（Lesson）
 * 將來加 6-Panel、Single Picture、Practical Writing，只需要喺 JSON 加資料（同喺 enum 加一個值）。
 */

const id = z.string().min(1);
const text = z.string().trim().min(1);
const status = z.enum(["active", "coming_soon"]);

export const englishWritingTypeSchema = z.enum(["picture-writing"]);
export const pictureFormatIdSchema = z.enum(["four-panel"]);
export const sampleLevelSchema = z.enum(["A", "B", "C"]);
export const vocabularyCategorySchema = z.enum(["common", "verb", "adjective", "time", "connective"]);

export const writingFormulaSchema = z.object({
  title: text,
  /** 整體寫作提示 */
  points: z.array(text).default([]),
  /** 每格應寫甚麼：第 N 項對應 Picture N */
  panelGuide: z
    .array(z.object({ label: text, prompt: text, /** 填充句式，空格用 ______ */ template: z.string().optional() }))
    .default([]),
});

/** 問題：可以係純文字，或者選擇題（options + answer） */
export const englishQuestionSchema = z.union([
  text,
  z.object({ text, options: z.array(text).min(2), answer: z.string().optional() }),
]);

export const englishCategorySchema = z.object({
  id: englishWritingTypeSchema,
  name: text,
  nameZh: z.string().default(""),
  description: z.string().default(""),
  icon: z.string().default("🖼️"),
  status,
  order: z.number(),
});

export const pictureFormatSchema = z.object({
  id: pictureFormatIdSchema,
  categoryId: englishWritingTypeSchema,
  name: text,
  nameZh: z.string().default(""),
  description: z.string().default(""),
  /** 圖片數量，例如四格圖 = 4 */
  panelCount: z.number().int().positive(),
  status,
  order: z.number(),
  /** 題目無自己嘅公式時用呢個 */
  writingFormula: writingFormulaSchema,
});

export const englishLessonSchema = z.object({
  id,
  title: text,
  writingType: englishWritingTypeSchema,
  pictureFormat: pictureFormatIdSchema,
  pictures: z
    .array(
      z.object({
        /** 相對網站根目錄，例如 english/lessons/lost-wallet/panel-1.png */
        imageUrl: text,
        caption: z.string().optional(),
      }),
    )
    .min(1),
  questions: z.array(englishQuestionSchema).min(1),
  writingFormula: writingFormulaSchema.optional(),
  vocabulary: z
    .array(
      z.object({
        word: text,
        meaning: z.string().optional(),
        example: z.string().optional(),
        category: vocabularyCategorySchema.default("common"),
      }),
    )
    .default([]),
  usefulSentences: z.array(z.object({ category: text, sentence: text })).default([]),
  sampleEssays: z
    .array(
      z.object({
        level: sampleLevelSchema,
        title: z.string().optional(),
        content: text,
        /** 例如「原稿」、「待審閱」 */
        tags: z.array(text).default([]),
      }),
    )
    .default([]),
  /** 寫作要求同評分（跟試卷） */
  requirements: z
    .object({
      pronoun: z.string().optional(),
      tense: z.string().optional(),
      minWords: z.number().int().positive().optional(),
      marks: z.array(z.object({ label: text, score: z.number().positive() })).default([]),
    })
    .optional(),
  /** 學生作文輸入區嘅預設內容（通常留空） */
  studentWriting: z.string().optional(),
  order: z.number(),
});

export type EnglishWritingType = z.infer<typeof englishWritingTypeSchema>;
export type PictureFormatId = z.infer<typeof pictureFormatIdSchema>;
export type SampleLevel = z.infer<typeof sampleLevelSchema>;
export type VocabularyCategory = z.infer<typeof vocabularyCategorySchema>;
export type EnglishQuestion = z.infer<typeof englishQuestionSchema>;
export type WritingFormula = z.infer<typeof writingFormulaSchema>;
export type EnglishCategory = z.infer<typeof englishCategorySchema>;
export type PictureFormat = z.infer<typeof pictureFormatSchema>;
export type WritingRequirements = NonNullable<z.infer<typeof englishLessonSchema>["requirements"]>;
export type EnglishWritingLesson = z.infer<typeof englishLessonSchema>;
