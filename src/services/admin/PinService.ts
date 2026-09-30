import type { KeyValueStore } from "@/repositories/local/keyValueStore";

/**
 * 內容管理 PIN。只係本機防止小朋友誤改，唔係正式安全系統。
 * 只儲存 PIN 嘅 SHA-256（加 salt），唔會儲存 PIN 本身。
 * 將來加入雲端登入時，由正式 Authentication 取代。
 */
const KEY = "smartlearning:admin-pin";
export const PIN_PATTERN = /^\d{4,6}$/;

interface StoredPin {
  salt: string;
  hash: string;
}

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export class PinService {
  constructor(private readonly store: KeyValueStore) {}

  private read(): StoredPin | null {
    try {
      const value = JSON.parse(this.store.getItem(KEY) ?? "null") as StoredPin | null;
      return value?.salt && value?.hash ? value : null;
    } catch {
      return null;
    }
  }

  hasPin() {
    return this.read() !== null;
  }

  /** 設定或者重設 PIN（4–6 位數字） */
  async setPin(pin: string) {
    if (!PIN_PATTERN.test(pin)) throw new Error("PIN 要係 4 至 6 位數字");
    const salt = randomSalt();
    this.store.setItem(KEY, JSON.stringify({ salt, hash: await sha256(salt + pin) }));
  }

  async verify(pin: string) {
    const stored = this.read();
    if (!stored || !PIN_PATTERN.test(pin)) return false;
    return (await sha256(stored.salt + pin)) === stored.hash;
  }
}

/** 忘記 PIN 時嘅家長驗證題：兩位數乘兩位數，小朋友較難即時答到 */
export function createParentChallenge(rng: () => number = Math.random) {
  const a = 12 + Math.floor(rng() * 80);
  const b = 12 + Math.floor(rng() * 80);
  return { question: `${a} × ${b} = ?`, answer: a * b };
}
