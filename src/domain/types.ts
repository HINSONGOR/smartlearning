import type { z } from "zod";
import type {
  essaySchema,
  exampleCategorySchema,
  exampleSchema,
  learningModuleSchema,
  levelIdSchema,
  levelSchema,
  paragraphPlanSchema,
  questionTypeSchema,
  statusSchema,
  subjectSchema,
  topicSchema,
  vocabularySchema,
  writingTypeSchema,
} from "./schemas";

export type Status = z.infer<typeof statusSchema>;
export type LevelId = z.infer<typeof levelIdSchema>;
export type Level = z.infer<typeof levelSchema>;
export type LearningModule = z.infer<typeof learningModuleSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type WritingType = z.infer<typeof writingTypeSchema>;
export type ParagraphPlan = z.infer<typeof paragraphPlanSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type Essay = z.infer<typeof essaySchema>;
export type Vocabulary = z.infer<typeof vocabularySchema>;
export type ExampleCategory = z.infer<typeof exampleCategorySchema>;
export type Example = z.infer<typeof exampleSchema>;
