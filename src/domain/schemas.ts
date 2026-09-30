import { z } from "zod";

/**
 * 所有教材資料嘅格式定義。
 * TypeScript 型別由呢度自動產生（見 types.ts），唔使寫兩次。
 */

const id = z.string().min(1);
const text = z.string().trim().min(1);

export const statusSchema = z.enum(["active", "coming_soon"]);
export const levelIdSchema = z.enum(["A", "B", "C"]);

/** 學習入口：首頁每張卡片就係一個 module，例如「中文作文」、「英文作文」 */
export const learningModuleSchema = z.object({
  id,
  /** 用嚟決定用邊套頁面顯示，例如 writing；未有對應頁面時用 general */
  kind: z.enum(["writing", "general"]),
  name: text,
  description: z.string().default(""),
  icon: z.string().default("📘"),
  status: statusSchema,
  order: z.number(),
});

export const subjectSchema = z.object({
  id,
  name: text,
  order: z.number(),
  modules: z.array(learningModuleSchema),
});

export const levelSchema = z.object({
  id: levelIdSchema,
  name: text,
  description: text,
  order: z.number(),
});

export const writingTypeSchema = z.object({
  id,
  moduleId: id,
  name: text,
  description: z.string().default(""),
  status: statusSchema,
  order: z.number(),
});

export const paragraphPlanSchema = z.object({
  label: text, // 第1段
  parts: z.array(text).min(1), // ["背景", "提出主題"]
  tip: z.string().optional(),
});

export const questionTypeSchema = z.object({
  id,
  writingTypeId: id,
  name: text,
  description: text,
  /** 一行公式，例如「背景 → 方法① → 方法② → 總結＋建議」 */
  formula: text,
  /** 四段式結構 */
  structure: z.array(paragraphPlanSchema).min(1),
  /** 寫作思路：一步一步點諗 */
  thinkingSteps: z.array(text),
  /** 仲未有正式內容 */
  isPlaceholder: z.boolean().default(false),
  order: z.number(),
});

export const topicSchema = z.object({
  id,
  questionTypeId: id,
  title: text,
  /** 寫作提示 */
  hints: z.array(text).default([]),
  keyConcepts: z.array(text).default([]),
  order: z.number(),
});

const timestamps = {
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
};

export const essaySchema = z.object({
  id,
  title: text,
  subjectId: id,
  writingTypeId: id,
  questionTypeId: id,
  topicId: z.string().optional(),
  level: levelIdSchema,
  /** 段落之間用空行分隔 */
  content: text,
  tags: z.array(text).default([]),
  ...timestamps,
});

export const vocabularySchema = z.object({
  id,
  word: text,
  jyutping: text,
  pinyin: z.string().default(""),
  definition: text,
  example: z.string().default(""),
  /** 類別，例如「說明文」、「連接詞」 */
  category: text,
  level: levelIdSchema,
  tags: z.array(text).default([]),
  /** 關聯題型／題目，用嚟喺題目頁顯示 */
  questionTypeIds: z.array(id).default([]),
  topicIds: z.array(id).default([]),
  ...timestamps,
});

export const exampleCategorySchema = z.enum(["生活", "學校", "學習", "社會"]);

export const exampleSchema = z.object({
  id,
  title: text,
  content: text,
  category: exampleCategorySchema,
  tags: z.array(text).default([]),
  questionTypeIds: z.array(id).default([]),
  topicIds: z.array(id).default([]),
  ...timestamps,
});
