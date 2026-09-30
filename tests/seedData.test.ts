import { describe, expect, it } from "vitest";
import { countChars, splitParagraphs } from "@/lib/text";
import { seedData } from "@/repositories/local/seedData";

const {
  subjects,
  levels,
  writingTypes,
  questionTypes,
  topics,
  essays,
  vocabulary,
  examples,
} = seedData;

const moduleIds = new Set(subjects.flatMap((s) => s.modules.map((m) => m.id)));
const subjectIds = new Set(subjects.map((s) => s.id));
const writingTypeIds = new Set(writingTypes.map((w) => w.id));
const questionTypeIds = new Set(questionTypes.map((q) => q.id));
const topicIds = new Set(topics.map((t) => t.id));

function expectUniqueIds(list: { id: string }[]) {
  const ids = list.map((x) => x.id);
  expect(new Set(ids).size, `重複 id：${ids}`).toBe(ids.length);
}

describe("/data 預設教材", () => {
  it("所有檔案嘅 id 都唔重複", () => {
    [subjects, levels, writingTypes, questionTypes, topics, essays, vocabulary, examples].forEach(
      expectUniqueIds,
    );
    expectUniqueIds(subjects.flatMap((s) => s.modules));
  });

  it("有 A／B／C 三個程度", () => {
    expect(levels.map((l) => l.id).sort()).toEqual(["A", "B", "C"]);
  });

  it("說明文有 5 種題型，每種都有四段結構", () => {
    const expository = questionTypes.filter((q) => q.writingTypeId === "expository");
    expect(expository.map((q) => q.name)).toEqual([
      "方法型",
      "利弊／影響型",
      "好處型",
      "原因型",
      "建議型",
    ]);
    expository.forEach((q) => expect(q.structure).toHaveLength(4));
  });

  it("關聯 id 全部指向存在嘅資料", () => {
    writingTypes.forEach((w) => expect(moduleIds, w.id).toContain(w.moduleId));
    questionTypes.forEach((q) => expect(writingTypeIds, q.id).toContain(q.writingTypeId));
    topics.forEach((t) => expect(questionTypeIds, t.id).toContain(t.questionTypeId));

    essays.forEach((e) => {
      expect(subjectIds, e.id).toContain(e.subjectId);
      expect(writingTypeIds, e.id).toContain(e.writingTypeId);
      expect(questionTypeIds, e.id).toContain(e.questionTypeId);
      if (e.topicId) expect(topicIds, e.id).toContain(e.topicId);
    });

    [...vocabulary, ...examples].forEach((item) => {
      item.questionTypeIds.forEach((id) => expect(questionTypeIds, item.id).toContain(id));
      item.topicIds.forEach((id) => expect(topicIds, item.id).toContain(id));
    });
  });

  it("範文嘅題型同題目一致", () => {
    const topicById = new Map(topics.map((t) => [t.id, t]));
    essays
      .filter((e) => e.topicId)
      .forEach((e) => expect(topicById.get(e.topicId!)!.questionTypeId, e.id).toBe(e.questionTypeId));
  });

  it("有填粵拼嘅詞語，格式正確（每個音節：字母＋聲調 1–6）", () => {
    vocabulary
      .filter((v) => v.jyutping)
      .forEach((v) => {
        expect(v.jyutping, v.word).toMatch(/^[a-z]+[1-6]( [a-z]+[1-6])*$/);
        expect(v.jyutping.split(" "), v.word).toHaveLength([...v.word].length);
      });
  });

  it("詞語唔重複", () => {
    const words = vocabulary.map((v) => v.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("範文段數對應題型結構，字數達到考試要求", () => {
    const qtById = new Map(questionTypes.map((q) => [q.id, q]));
    const wtById = new Map(writingTypes.map((w) => [w.id, w]));
    essays.forEach((e) => {
      const paragraphs = splitParagraphs(e.content);
      const expected = e.paragraphLabels?.length ?? qtById.get(e.questionTypeId)!.structure.length;
      expect(paragraphs, e.id).toHaveLength(expected);

      // 用戶原稿唔自動改，字數不足會喺畫面提示；Claude 寫嘅一定要達標
      if (e.tags.includes("原稿")) return;
      const minChars = wtById.get(e.writingTypeId)?.requirements?.minChars ?? 0;
      expect(countChars(e.content), e.id).toBeGreaterThanOrEqual(minChars);
    });
  });

  it("計字唔計標點同空白", () => {
    expect(countChars("首先，我們要訂立目標。\n\n例如：AI！")).toBe(13);
  });
});
