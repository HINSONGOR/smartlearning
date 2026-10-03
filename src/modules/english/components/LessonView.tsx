import type { EnglishWritingLesson, WritingFormula } from "@/domain/english";
import {
  FormulaPanel,
  QuestionList,
  SampleEssays,
  Section,
  SentencesPanel,
  StudentWriting,
  VocabularyPanel,
} from "./LessonSections";
import { PictureGrid } from "./PictureGrid";

/**
 * 四格圖作文練習頁：
 * 桌面 → 左邊（固定）四格圖＋問題；右邊公式、詞彙、句式、範文、學生寫作
 * 手機／iPad → 由上至下排列
 */
export function LessonView({
  lesson,
  formula,
}: {
  lesson: EnglishWritingLesson;
  formula?: WritingFormula;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
      <div className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-2">
        <PictureGrid pictures={lesson.pictures} />
        <Section title="Questions">
          <QuestionList questions={lesson.questions} />
        </Section>
      </div>

      <div className="space-y-10">
        {formula && (
          <Section title="Writing Formula">
            <FormulaPanel formula={formula} />
          </Section>
        )}
        {lesson.vocabulary.length > 0 && (
          <Section title="Useful Vocabulary">
            <VocabularyPanel vocabulary={lesson.vocabulary} />
          </Section>
        )}
        {lesson.usefulSentences.length > 0 && (
          <Section title="Useful Sentences">
            <SentencesPanel sentences={lesson.usefulSentences} />
          </Section>
        )}
        {lesson.sampleEssays.length > 0 && (
          <Section title="Sample Essays">
            <SampleEssays samples={lesson.sampleEssays} />
          </Section>
        )}
        <Section title="Student Writing">
          <StudentWriting initial={lesson.studentWriting} />
        </Section>
      </div>
    </div>
  );
}
