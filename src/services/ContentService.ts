import type { z } from "zod";
import type { CrudRepository } from "@/repositories/interfaces";
import type { ChangeNotifier } from "./changes";

type Timestamped = { id: string; createdAt?: string; updatedAt?: string };

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 搜尋：每個關鍵字都要喺其中一個欄位出現（唔分大細楷） */
export function matchesSearch(fields: (string | undefined)[], query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

/** 範文、詞語、例子共用嘅新增／編輯／刪除邏輯 */
export abstract class ContentService<T extends Timestamped, F> {
  constructor(
    protected readonly repo: CrudRepository<T>,
    private readonly schema: z.ZodType<T>,
    private readonly changes: ChangeNotifier,
  ) {}

  protected abstract matches(item: T, filter: F): boolean;

  async list(filter?: F): Promise<T[]> {
    const items = await this.repo.list();
    return filter ? items.filter((item) => this.matches(item, filter)) : items;
  }

  get(id: string) {
    return this.repo.get(id);
  }

  /** 無 id 即係新增；會驗證格式同更新時間 */
  async save(input: Omit<T, "id"> & { id?: string }): Promise<T> {
    const now = new Date().toISOString();
    const existing = input.id ? await this.repo.get(input.id) : undefined;
    const item = this.schema.parse({
      ...input,
      id: input.id || newId(),
      createdAt: existing?.createdAt ?? input.createdAt ?? now,
      updatedAt: now,
    });
    const saved = await this.repo.save(item);
    this.changes.notify();
    return saved;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    this.changes.notify();
  }
}
