import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryStore, type KeyValueStore } from "@/repositories/local/keyValueStore";
import { createServices, type Services } from "@/services/container";

let store: KeyValueStore;
let services: Services;

beforeEach(() => {
  store = createMemoryStore();
  services = createServices(store);
});

describe("CurriculumService", () => {
  it("首頁入口按 order 排，中文作文排第一", async () => {
    const modules = await services.curriculum.listHomeModules();
    expect(modules.map((m) => m.name)).toEqual(["中文作文", "English Writing", "中文", "常識"]);
    expect(modules[0]).toMatchObject({ status: "active", subjectId: "chinese" });
  });

  it("說明文 4 個題型按次序", async () => {
    const qts = await services.curriculum.listQuestionTypes("expository");
    expect(qts.map((q) => q.name)).toEqual(["方法／建議型", "利弊／影響型", "好處型", "原因型"]);
  });
});

describe("EssayService", () => {
  it("題目範文按 C、B、A 排", async () => {
    const essays = await services.essays.listForTopic("self-discipline");
    expect(essays.map((e) => e.level)).toEqual(["C", "B", "A"]);
  });

  it("可以按程度同關鍵字篩選", async () => {
    const result = await services.essays.list({ level: "B", search: "自律" });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((e) => expect(e.level).toBe("B"));
  });

  it("新增範文會自動產生 id 同時間，重新開 app 仍然存在", async () => {
    const saved = await services.essays.save({
      title: "測試範文",
      subjectId: "chinese",
      writingTypeId: "expository",
      questionTypeId: "expository-method",
      level: "C",
      content: "第一段\n\n第二段",
      tags: [],
    });
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeTruthy();

    const reopened = createServices(store);
    expect(await reopened.essays.get(saved.id)).toMatchObject({ title: "測試範文" });
  });

  it("編輯預設範文唔會改動原始資料，只係覆蓋", async () => {
    const original = (await services.essays.get("self-discipline-b"))!;
    await services.essays.save({ ...original, title: "改咗" });
    expect((await services.essays.get("self-discipline-b"))!.title).toBe("改咗");
    // 另一個乾淨嘅 store 仍然係原本標題
    const fresh = createServices(createMemoryStore());
    expect((await fresh.essays.get("self-discipline-b"))!.title).toBe(original.title);
  });

  it("刪除預設範文之後唔再出現", async () => {
    await services.essays.delete("self-discipline-a");
    expect(await services.essays.get("self-discipline-a")).toBeUndefined();
    expect(await createServices(store).essays.get("self-discipline-a")).toBeUndefined();
  });

  it("格式錯誤嘅資料唔可以儲存", async () => {
    await expect(
      services.essays.save({
        title: "",
        subjectId: "chinese",
        writingTypeId: "expository",
        questionTypeId: "expository-method",
        level: "C",
        content: "x",
        tags: [],
      }),
    ).rejects.toThrow();
  });

  it("localStorage 資料損壞時唔會 crash，照樣讀到預設範文", async () => {
    store.setItem("smartlearning:essays", "{壞咗");
    expect((await createServices(store).essays.list()).length).toBeGreaterThan(0);

    store.setItem(
      "smartlearning:essays",
      JSON.stringify({ upserts: { x: { id: "x", title: 1 } }, deletedIds: "no" }),
    );
    const essays = await createServices(store).essays.list();
    expect(essays.find((e) => e.id === "x")).toBeUndefined();
  });

  it("儲存後會通知畫面更新", async () => {
    let calls = 0;
    services.changes.subscribe(() => calls++);
    await services.essays.delete("self-discipline-a");
    expect(calls).toBe(1);
  });
});

describe("VocabularyService / ExampleService", () => {
  it("題目頁詞語包括直接關聯題目或題型嘅詞語", async () => {
    const words = await services.vocabulary.listForTopic("self-discipline", "expository-method");
    expect(words.map((w) => w.word)).toContain("自律");
    expect(words.map((w) => w.word)).toContain("那麼");
  });

  it("可以按類別搜尋詞語", async () => {
    const connectors = await services.vocabulary.list({ category: "連接詞" });
    expect(connectors.every((v) => v.category === "連接詞")).toBe(true);
    expect(connectors.length).toBeGreaterThan(10);
  });

  it("每條題目最少有 2 個例子", async () => {
    for (const topic of await services.curriculum.listTopics()) {
      expect((await services.examples.listForTopic(topic.id)).length, topic.id).toBeGreaterThanOrEqual(2);
    }
  });
});
