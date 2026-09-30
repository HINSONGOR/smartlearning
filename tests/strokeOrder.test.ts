import { describe, expect, it } from "vitest";
import {
  StrokeOrderService,
  UrlStrokeDataSource,
  type CharStrokeData,
  type StrokeDataSource,
} from "@/services/strokeOrder/StrokeOrderService";

const data: CharStrokeData = { strokes: ["M 0 0"], medians: [[[0, 0]]] };
const source = (map: Record<string, CharStrokeData>, calls: string[] = []): StrokeDataSource => ({
  load: async (c) => {
    calls.push(c);
    return map[c] ?? null;
  },
});

describe("StrokeOrderService", () => {
  it("第一個來源無資料就試下一個（本機 → 網上）", async () => {
    const service = new StrokeOrderService([source({}), source({ 衞: data })]);
    expect(await service.load("衞")).toBe(data);
  });

  it("全部來源都無就回傳 null，唔會 throw", async () => {
    const broken: StrokeDataSource = { load: () => Promise.reject(new Error("offline")) };
    const service = new StrokeOrderService([broken, source({})]);
    expect(await service.load("龘")).toBeNull();
  });

  it("同一個字只讀一次", async () => {
    const calls: string[] = [];
    const service = new StrokeOrderService([source({ 學: data }, calls)]);
    await service.load("學");
    await service.load("學");
    expect(calls).toEqual(["學"]);
  });

  it("非漢字（標點、英文）直接無資料", async () => {
    const calls: string[] = [];
    const service = new StrokeOrderService([source({}, calls)]);
    expect(await service.load("，")).toBeNull();
    expect(await service.load("A")).toBeNull();
    expect(calls).toEqual([]);
  });

  it("URL 來源：格式唔啱或者 404 都當無資料", async () => {
    const make = (body: unknown, ok = true) =>
      new UrlStrokeDataSource(
        (c) => c,
        async () => ({ ok, json: async () => body }) as Response,
      );
    expect(await make(data).load("學")).toEqual(data);
    expect(await make({ strokes: [] }).load("學")).toBeNull();
    expect(await make(data, false).load("學")).toBeNull();
  });
});
