/**
 * 筆順資料服務：Character → Stroke Data。
 * 畫面（renderer）唔理資料由邊度嚟；將來換香港標準筆順資料，只需要加一個 StrokeDataSource。
 */

export interface CharStrokeData {
  /** SVG path，每筆一條 */
  strokes: string[];
  /** 每筆嘅中線座標，用嚟做筆順動畫 */
  medians: number[][][];
  radStrokes?: number[];
}

export interface StrokeDataSource {
  /** 搵唔到就回傳 null */
  load(char: string): Promise<CharStrokeData | null>;
}

function isStrokeData(value: unknown): value is CharStrokeData {
  const v = value as CharStrokeData;
  return (
    !!v &&
    Array.isArray(v.strokes) &&
    Array.isArray(v.medians) &&
    v.strokes.length > 0 &&
    v.strokes.length === v.medians.length
  );
}

/** 用 URL 讀 JSON（本機 /stroke-data 或者 CDN） */
export class UrlStrokeDataSource implements StrokeDataSource {
  constructor(
    private readonly urlFor: (char: string) => string,
    private readonly fetcher: typeof fetch = (...args) => fetch(...args),
  ) {}

  async load(char: string) {
    try {
      const res = await this.fetcher(this.urlFor(char));
      if (!res.ok) return null;
      const data: unknown = await res.json();
      return isStrokeData(data) ? data : null;
    } catch {
      return null;
    }
  }
}

/** 本機：public/stroke-data（由 scripts/copy-stroke-data.mjs 產生） */
export const localStrokeSource = () =>
  new UrlStrokeDataSource((c) => `/stroke-data/${encodeURIComponent(c)}.json`);

/** 網上：教材以外嘅字（例如家長自己加嘅詞語） */
export const cdnStrokeSource = () =>
  new UrlStrokeDataSource(
    (c) => `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`,
  );

export class StrokeOrderService {
  private cache = new Map<string, Promise<CharStrokeData | null>>();

  /** 按次序試每個來源，第一個有資料嘅就用 */
  constructor(private readonly sources: StrokeDataSource[]) {}

  load(char: string): Promise<CharStrokeData | null> {
    if (!/^\p{Script=Han}$/u.test(char)) return Promise.resolve(null);
    let pending = this.cache.get(char);
    if (!pending) {
      pending = this.loadUncached(char);
      this.cache.set(char, pending);
    }
    return pending;
  }

  private async loadUncached(char: string) {
    for (const source of this.sources) {
      const data = await source.load(char).catch(() => null);
      if (data) return data;
    }
    return null;
  }
}
