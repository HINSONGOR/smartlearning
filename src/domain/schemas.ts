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
  kind: z.enum(["writing", "english-writing", "general"]),
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
  /** coming_soon：範文暫時唔顯示（資料保留） */
  status: statusSchema.default("active"),
});

export const writingTypeSchema = z.object({
  id,
  moduleId: id,
  name: text,
  description: z.string().default(""),
  status: statusSchema,
  order: z.number(),
  /** 考試要求，例如最少字數（不計標點）同限時 */
  requirements: z
    .object({
      minChars: z.number().int().positive(),
      timeLimitMinutes: z.number().int().positive(),
    })
    .optional(),
});

export const paragraphPlanSchema = z.object({
  label: text, // 第1段
  parts: z.array(text).min(1), // ["背景", "提出主題"]
  /** 填充句式，空格用 ＿＿ 表示 */
  template: z.string().optional(),
  /** 📌 記住：一句話記住呢段點寫 */
  remember: z.string().optional(),
});

export const questionTypeSchema = z.object({
  id,
  writingTypeId: id,
  name: text,
  /** 口訣，例如「方法1 方法2」、「正反」、「正正」 */
  mnemonic: z.string().default(""),
  description: text,
  /** 一行公式，例如「背景 → 方法① → 方法② → 總結＋建議」 */
  formula: text,
  /** 四段式結構 */
  structure: z.array(paragraphPlanSchema).min(1),
  /** 寫作思路：一步一步點諗 */
  thinkingSteps: z.array(text),
  /** 常用論點庫，例如「10 個最常用好處」，usage 係可以套用嘅題材 */
  ideaBank: z
    .array(z.object({ point: text, usage: z.string().default("") }))
    .default([]),
  /** 仲未有正式內容 */
  isPlaceholder: z.boolean().default(false),
  order: z.number(),
});

export const topicSchema = z.object({
  id,
  questionTypeId: id,
  title: text,
  /** 本題四段大綱，第 N 項對應題型結構第 N 段 */
  outline: z.array(text).default([]),
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
  /** 段落之間用空行分隔；第 N 段預設對應題型結構第 N 段 */
  content: text,
  /** 範文結構同題型公式唔同時，用嚟逐段覆蓋標籤 */
  paragraphLabels: z.array(text).optional(),
  tags: z.array(text).default([]),
  ...timestamps,
});

export const vocabularySchema = z.object({
  id,
  word: text,
  jyutping: z.string().default(""),
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
