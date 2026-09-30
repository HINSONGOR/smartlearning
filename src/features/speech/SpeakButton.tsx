"use client";

import { useState } from "react";
import { useServices } from "@/hooks/useServiceQuery";
import { langLabels, type SpeechLang } from "@/services/tts/TTSService";

interface Props {
  text: string;
  lang: SpeechLang;
  /** 細版：用喺例句旁邊 */
  compact?: boolean;
}

const setupHint: Record<SpeechLang, string> = {
  yue: "iPad／iPhone：設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文 → 中文（香港）。Windows：設定 → 時間與語言 → 語音 → 新增語音 → 中文（香港）。",
  cmn: "iPad／iPhone：設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文 → 中文（中國大陸）。Windows：設定 → 時間與語言 → 語音 → 新增語音 → 中文（簡體，中國）。",
};

/** 🔊 讀音按鈕：無對應聲音時顯示提示，唔會影響其他功能 */
export function SpeakButton({ text, lang, compact }: Props) {
  const { tts } = useServices();
  const [state, setState] = useState<"idle" | "speaking" | "no-voice" | "error">("idle");

  const onClick = async () => {
    if (state === "speaking") {
      tts.stop();
      setState("idle");
      return;
    }
    setState("speaking");
    const result = await tts.speak(text, { lang });
    setState(result.ok ? "idle" : result.reason === "error" ? "error" : "no-voice");
  };

  const label = langLabels[lang];
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={`用${label}讀出「${text}」`}
        className={
          compact
            ? "inline-flex h-10 items-center gap-1 rounded-xl bg-surface-2 px-3 text-base"
            : `inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-lg font-medium transition ${
                state === "speaking" ? "bg-primary text-on-primary" : "bg-primary-soft text-primary"
              }`
        }
      >
        <span aria-hidden>{state === "speaking" ? "⏹" : "🔊"}</span>
        {label}
      </button>
      {state === "no-voice" && (
        <span role="status" className="max-w-sm text-sm text-danger">
          呢部裝置未有{label}語音。{setupHint[lang]}
        </span>
      )}
      {state === "error" && (
        <span role="status" className="text-sm text-danger">
          播放唔到，請再試一次。
        </span>
      )}
    </span>
  );
}
