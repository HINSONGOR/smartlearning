import type { z } from "zod";
import type { CrudRepository } from "../interfaces";
import type { KeyValueStore } from "./keyValueStore";

/**
 * 喺 localStorage 記錄你對預設教材嘅改動：
 *   upserts：新增或者改過嘅項目（用 id 做 key）
 *   deletedIds：刪除咗嘅預設項目
 * /data 入面嘅原始 JSON 永遠唔會被改寫。
 */
interface Overlay<T> {
  upserts: Record<string, T>;
  deletedIds: string[];
}

export class LocalCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  private readonly key: string;

  constructor(
    name: string,
    private readonly seed: readonly T[],
    private readonly schema: z.ZodType<T>,
    private readonly store: KeyValueStore,
  ) {
    this.key = `smartlearning:${name}`;
  }

  async list(): Promise<T[]> {
    const overlay = this.readOverlay();
    const deleted = new Set(overlay.deletedIds);
    const result = this.seed
      .filter((item) => !deleted.has(item.id))
      .map((item) => overlay.upserts[item.id] ?? item);
    const seedIds = new Set(this.seed.map((item) => item.id));
    for (const item of Object.values(overlay.upserts)) {
      if (!seedIds.has(item.id)) result.push(item);
    }
    return result;
  }

  async get(id: string): Promise<T | undefined> {
    return (await this.list()).find((item) => item.id === id);
  }

  async save(item: T): Promise<T> {
    const valid = this.schema.parse(item);
    const overlay = this.readOverlay();
    overlay.upserts[valid.id] = valid;
    overlay.deletedIds = overlay.deletedIds.filter((id) => id !== valid.id);
    this.writeOverlay(overlay);
    return valid;
  }

  async delete(id: string): Promise<void> {
    const overlay = this.readOverlay();
    delete overlay.upserts[id];
    if (this.seed.some((item) => item.id === id) && !overlay.deletedIds.includes(id)) {
      overlay.deletedIds.push(id);
    }
    this.writeOverlay(overlay);
  }

  private readOverlay(): Overlay<T> {
    const empty: Overlay<T> = { upserts: {}, deletedIds: [] };
    const raw = this.store.getItem(this.key);
    if (!raw) return empty;
    try {
      const parsed = JSON.parse(raw) as Partial<Overlay<unknown>>;
      const upserts: Record<string, T> = {};
      // 逐項驗證，壞咗嘅項目會略過，唔會令成個 app 失效
      for (const value of Object.values(parsed.upserts ?? {})) {
        const result = this.schema.safeParse(value);
        if (result.success) upserts[result.data.id] = result.data;
      }
      const deletedIds = Array.isArray(parsed.deletedIds)
        ? parsed.deletedIds.filter((id): id is string => typeof id === "string")
        : [];
      return { upserts, deletedIds };
    } catch {
      return empty;
    }
  }

  private writeOverlay(overlay: Overlay<T>) {
    this.store.setItem(this.key, JSON.stringify(overlay));
  }
}
