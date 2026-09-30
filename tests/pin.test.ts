import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/repositories/local/keyValueStore";
import { createParentChallenge, PinService } from "@/services/admin/PinService";

describe("PinService", () => {
  it("未設定 PIN 時 hasPin 係 false，任何 PIN 都唔通過", async () => {
    const pins = new PinService(createMemoryStore());
    expect(pins.hasPin()).toBe(false);
    expect(await pins.verify("1234")).toBe(false);
  });

  it("設定之後只接受正確 PIN，而且唔會儲存 PIN 本身", async () => {
    const store = createMemoryStore();
    const pins = new PinService(store);
    await pins.setPin("2468");
    expect(pins.hasPin()).toBe(true);
    expect(await pins.verify("2468")).toBe(true);
    expect(await pins.verify("1357")).toBe(false);
    expect(store.getItem("smartlearning:admin-pin")).not.toContain("2468");
  });

  it("PIN 要 4 至 6 位數字", async () => {
    const pins = new PinService(createMemoryStore());
    await expect(pins.setPin("12")).rejects.toThrow();
    await expect(pins.setPin("abcd")).rejects.toThrow();
    await expect(pins.setPin("1234567")).rejects.toThrow();
  });

  it("重設 PIN 之後舊 PIN 失效", async () => {
    const pins = new PinService(createMemoryStore());
    await pins.setPin("1111");
    await pins.setPin("2222");
    expect(await pins.verify("1111")).toBe(false);
    expect(await pins.verify("2222")).toBe(true);
  });

  it("儲存資料損壞時當作未設定，唔會 crash", async () => {
    const store = createMemoryStore();
    store.setItem("smartlearning:admin-pin", "{壞");
    expect(new PinService(store).hasPin()).toBe(false);
  });

  it("家長驗證題答案正確", () => {
    const c = createParentChallenge(() => 0);
    expect(c.question).toBe("12 × 12 = ?");
    expect(c.answer).toBe(144);
  });
});
