/** 簡單嘅 key-value 儲存，方便測試時用記憶體代替 localStorage */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
  };
}

/** 瀏覽器用 localStorage；伺服器或者私隱模式用唔到時，退回記憶體（唔會 crash） */
export function createBrowserStore(): KeyValueStore {
  const fallback = createMemoryStore();
  const storage = typeof window === "undefined" ? null : safeLocalStorage();
  if (!storage) return fallback;
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key);
      } catch {
        return fallback.getItem(key);
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value);
      } catch {
        fallback.setItem(key, value);
      }
    },
  };
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
