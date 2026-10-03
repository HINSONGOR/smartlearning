import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/repositories/local/keyValueStore";
import { englishSeedData } from "@/repositories/local/englishSeedData";
import { countWords } from "@/lib/text";
import { moduleHref, usesLearnRoute } from "@/modules/registry";
import { createServices } from "@/services/container";

const { categories, pictureFormats, lessons } = englishSeedData;

describe("data/english 英文作文資料", () => {
  it("id 唔重複", () => {
    for (const list of [categories, pictureFormats, lessons]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("圖片格式指向存在嘅類別；題目指向存在嘅格式同類別", () => {
    pictureFormats.forEach((f) => expect(categories.map((c) => c.id)).toContain(f.categoryId));
    lessons.forEach((l) => {
      const f = pictureFormats.find((x) => x.id === l.pictureFormat);
      expect(f, l.id).toBeDefined();
      expect(f!.categoryId, l.id).toBe(l.writingType);
    });
  });

  it("四格圖題目：圖片數量啱、有兩條問題、圖片檔案存在", () => {
    lessons.forEach((l) => {
      const f = pictureFormats.find((x) => x.id === l.pictureFormat)!;
      expect(l.pictures, l.id).toHaveLength(f.panelCount);
      expect(l.questions, l.id).toHaveLength(2);
      l.pictures.forEach((p) =>
        expect(fs.existsSync(path.join("public", p.imageUrl)), p.imageUrl).toBe(true),
      );
    });
  });

  it("選擇題嘅答案係其中一個選項", () => {
    lessons.flatMap((l) => l.questions).forEach((q) => {
      if (typeof q !== "string" && q.answer !== undefined) expect(q.options).toContain(q.answer);
    });
  });

  it("範文 A／B／C 各一篇，而且唔重複", () => {
    lessons.forEach((l) => {
      expect(l.sampleEssays.map((s) => s.level).sort(), l.id).toEqual(["A", "B", "C"]);
    });
  });

  it("英文字數計法", () => {
    expect(countWords("Last Sunday, I went to the city centre.")).toBe(8);
    expect(countWords("  ")).toBe(0);
  });
});

describe("EnglishWritingService", () => {
  const { englishWriting, curriculum } = createServices(createMemoryStore());

  it("English Writing → Picture Writing → 4-Panel Picture → 題目", async () => {
    expect((await englishWriting.listCategories()).map((c) => c.id)).toEqual(["picture-writing"]);
    expect((await englishWriting.listPictureFormats("picture-writing")).map((f) => f.id)).toEqual(["four-panel"]);
    expect((await englishWriting.listLessons("four-panel")).length).toBeGreaterThan(0);
  });

  it("題目無自己嘅公式時用格式預設公式", async () => {
    const lesson = (await englishWriting.listLessons())[0];
    const formula = await englishWriting.getWritingFormula({ ...lesson, writingFormula: undefined });
    expect(formula?.title).toBe(pictureFormats[0].writingFormula.title);
  });

  it("範文按 C、B、A 排", async () => {
    const lesson = (await englishWriting.listLessons())[0];
    expect(englishWriting.sortSamples(lesson).map((s) => s.level)).toEqual(["C", "B", "A"]);
  });

  it("首頁 English Writing 卡片連去英文頁面，中文作文照舊用 /learn", async () => {
    const modules = await curriculum.listHomeModules();
    const english = modules.find((m) => m.id === "english-writing")!;
    const chinese = modules.find((m) => m.id === "chinese-writing")!;
    expect(english.status).toBe("active");
    expect(moduleHref(english)).toBe("/english-writing");
    expect(usesLearnRoute(english)).toBe(false);
    expect(moduleHref(chinese)).toBe("/learn/chinese-writing");
    expect(usesLearnRoute(chinese)).toBe(true);
  });
});
