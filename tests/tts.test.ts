import { describe, expect, it } from "vitest";
import { TTSService, type TTSProvider } from "@/services/tts/TTSService";
import { pickVoice } from "@/services/tts/WebSpeechProvider";

const voices = [
  { lang: "en-US", name: "Samantha" },
  { lang: "zh-TW", name: "Mei-Jia" },
  { lang: "zh-HK", name: "Sin-ji" },
  { lang: "zh-CN", name: "Ting-Ting" },
];

describe("pickVoice", () => {
  it("粵語揀 zh-HK", () => {
    expect(pickVoice(voices, "yue")?.name).toBe("Sin-ji");
  });

  it("普通話優先 zh-CN，無就用 zh-TW，唔會揀粵語聲音", () => {
    expect(pickVoice(voices, "cmn")?.name).toBe("Ting-Ting");
    expect(pickVoice(voices.filter((v) => v.lang !== "zh-CN"), "cmn")?.name).toBe("Mei-Jia");
    expect(pickVoice([{ lang: "zh-HK", name: "Sin-ji" }], "cmn")).toBeUndefined();
  });

  it("認得 Android 格式同名稱有 Cantonese 嘅聲音", () => {
    expect(pickVoice([{ lang: "yue_HK", name: "x" }], "yue")).toBeDefined();
    expect(pickVoice([{ lang: "zh", name: "Google 粵語（香港）" }], "yue")).toBeDefined();
  });

  it("無粵語聲音就回傳 undefined，唔會用普通話扮粵語", () => {
    expect(pickVoice([{ lang: "zh-CN", name: "Ting-Ting" }], "yue")).toBeUndefined();
  });
});

describe("TTSService", () => {
  it("provider 出錯唔會 throw，會回傳 error", async () => {
    const broken: TTSProvider = {
      hasVoice: () => Promise.reject(new Error("x")),
      speak: () => Promise.reject(new Error("x")),
      stop: () => {
        throw new Error("x");
      },
    };
    const tts = new TTSService(broken);
    expect(await tts.speak("自律", { lang: "yue" })).toEqual({ ok: false, reason: "error" });
    expect(await tts.hasVoice("yue")).toBe(false);
    expect(() => tts.stop()).not.toThrow();
  });

  it("關聯詞嘅省略號會變成停頓", async () => {
    let spoken = "";
    const tts = new TTSService({
      hasVoice: async () => true,
      speak: async (text) => {
        spoken = text;
        return { ok: true };
      },
      stop: () => {},
    });
    await tts.speak("不但……還……", { lang: "yue" });
    expect(spoken).toBe("不但，還，");
  });
});
