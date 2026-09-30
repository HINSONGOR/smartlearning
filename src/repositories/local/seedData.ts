import { z } from "zod";
import {
  essaySchema,
  exampleSchema,
  levelSchema,
  questionTypeSchema,
  subjectSchema,
  topicSchema,
  vocabularySchema,
  writingTypeSchema,
} from "@/domain/schemas";
import essaysJson from "@data/essays.json";
import examplesJson from "@data/examples.json";
import levelsJson from "@data/levels.json";
import questionTypesJson from "@data/questionTypes.json";
import subjectsJson from "@data/subjects.json";
import topicsJson from "@data/topics.json";
import vocabularyJson from "@data/vocabulary.json";
import writingTypesJson from "@data/writingTypes.json";

/** 讀取 /data 入面嘅 JSON，並用 schema 驗證。格式錯會即刻報錯，指出邊個檔案。 */
function load<T extends z.ZodType>(file: string, schema: T, raw: unknown) {
  const result = z.array(schema).safeParse(raw);
  if (!result.success) {
    throw new Error(`data/${file} 格式錯誤：\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const seedData = {
  subjects: load("subjects.json", subjectSchema, subjectsJson),
  levels: load("levels.json", levelSchema, levelsJson),
  writingTypes: load("writingTypes.json", writingTypeSchema, writingTypesJson),
  questionTypes: load("questionTypes.json", questionTypeSchema, questionTypesJson),
  topics: load("topics.json", topicSchema, topicsJson),
  essays: load("essays.json", essaySchema, essaysJson),
  vocabulary: load("vocabulary.json", vocabularySchema, vocabularyJson),
  examples: load("examples.json", exampleSchema, examplesJson),
};

export type SeedData = typeof seedData;
