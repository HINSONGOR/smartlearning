import type { SpeakOptions, SpeakResult, SpeechLang, TTSProvider } from "./TTSService";

/** 最接近嘅聲音類型，用嚟喺裝置上揀聲音 */
export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

const langCode: Record<SpeechLang, string> = { yue: "zh-HK", cmn: "zh-CN" };

/**
 * 揀聲音：
 * - 粵語：zh-HK、yue、或者名稱有 Cantonese／粵語／廣東話
 * - 普通話：zh-CN 優先，其次 zh-TW、cmn（但唔可以係粵語聲音）
 * 搵唔到就回傳 undefined，唔會用錯語言扮讀。
 */
export function pickVoice<V extends VoiceLike>(voices: V[], lang: SpeechLang): V | undefined {
  const norm = (s: string) => s.toLowerCase().replace("_", "-");
  const isCantonese = (v: V) =>
    /^(zh-hk|yue|zh-yue)/.test(norm(v.lang)) || /cantonese|粵語|廣東話/i.test(v.name);

  if (lang === "yue") return voices.find(isCantonese);

  const mandarin = voices.filter((v) => !isCantonese(v));
  return (
    mandarin.find((v) => /^(zh-cn|cmn)/.test(norm(v.lang))) ??
    mandarin.find((v) => /^zh-tw/.test(norm(v.lang))) ??
    mandarin.find((v) => /^zh/.test(norm(v.lang)))
  );
}

/** 瀏覽器內建語音（Web Speech API） */
export class WebSpeechProvider implements TTSProvider {
  private get synth(): SpeechSynthesis | undefined {
    return typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : undefined;
  }

  /** 有啲瀏覽器（Chrome）要等 voiceschanged 先有聲音清單 */
  private loadVoices(): Promise<SpeechSynthesisVoice[]> {
    const synth = this.synth;
    if (!synth) return Promise.resolve([]);
    const voices = synth.getVoices();
    if (voices.length) return Promise.resolve(voices);
    return new Promise((resolve) => {
      const done = () => resolve(synth.getVoices());
      synth.addEventListener("voiceschanged", done, { once: true });
      setTimeout(done, 1500);
    });
  }

  async hasVoice(lang: SpeechLang) {
    return pickVoice(await this.loadVoices(), lang) !== undefined;
  }

  async speak(text: string, { lang, rate = 1 }: SpeakOptions): Promise<SpeakResult> {
    const synth = this.synth;
    if (!synth) return { ok: false, reason: "unsupported" };
    const voice = pickVoice(await this.loadVoices(), lang);
    if (!voice) return { ok: false, reason: "no-voice" };

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || langCode[lang];
    utterance.rate = rate;

    return new Promise((resolve) => {
      utterance.onend = () => resolve({ ok: true });
      // 俾人撳停（interrupted／canceled）唔當係錯誤
      utterance.onerror = (e) =>
        resolve(
          e.error === "interrupted" || e.error === "canceled"
            ? { ok: true }
            : { ok: false, reason: "error" },
        );
      synth.speak(utterance);
    });
  }

  stop() {
    this.synth?.cancel();
  }
}
