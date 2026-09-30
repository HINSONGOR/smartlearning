/**
 * 讀音服務。UI 只用 TTSService，唔會直接接觸瀏覽器語音或者任何 TTS 供應商。
 * 將來換雲端 TTS，只需要寫一個新 TTSProvider，喺 services/container.ts 換上。
 */

/** yue = 粵語，cmn = 普通話 */
export type SpeechLang = "yue" | "cmn";

export interface SpeakOptions {
  lang: SpeechLang;
  /** 語速，1 = 正常 */
  rate?: number;
}

export type SpeakResult = { ok: true } | { ok: false; reason: "unsupported" | "no-voice" | "error" };

export interface TTSProvider {
  /** 呢部裝置有冇對應語言嘅聲音 */
  hasVoice(lang: SpeechLang): Promise<boolean>;
  speak(text: string, options: SpeakOptions): Promise<SpeakResult>;
  stop(): void;
}

export const langLabels: Record<SpeechLang, string> = { yue: "粵語", cmn: "普通話" };

export class TTSService {
  constructor(private readonly provider: TTSProvider) {}

  hasVoice(lang: SpeechLang) {
    return this.provider.hasVoice(lang).catch(() => false);
  }

  /** 唔會 throw：任何問題都變成 { ok: false }，由 UI 顯示提示 */
  async speak(text: string, options: SpeakOptions): Promise<SpeakResult> {
    const clean = text.replace(/…+/g, "，").trim();
    if (!clean) return { ok: true };
    try {
      return await this.provider.speak(clean, { rate: 0.85, ...options });
    } catch {
      return { ok: false, reason: "error" };
    }
  }

  stop() {
    try {
      this.provider.stop();
    } catch {
      // 忽略
    }
  }
}
