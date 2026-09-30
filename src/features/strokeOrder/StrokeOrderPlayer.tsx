"use client";

import { useEffect, useRef, useState } from "react";
import { useServices } from "@/hooks/useServiceQuery";
import {
  createHanziWriterRenderer,
  type StrokeRenderer,
} from "@/services/strokeOrder/HanziWriterRenderer";

const SIZE = 220;
const speeds = [
  { label: "🐢 慢", value: 0.5 },
  { label: "中", value: 1 },
  { label: "🐇 快", value: 2 },
];

type Status = "loading" | "ready" | "playing" | "paused" | "missing";

/** ✍️ 單個漢字嘅筆順：播放、暫停、重播、逐筆、速度 */
export function StrokeOrderPlayer({ char }: { char: string }) {
  const { strokeOrder } = useServices();
  const boxRef = useRef<HTMLDivElement>(null);
  const [r, setRenderer] = useState<StrokeRenderer | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [speed, setSpeed] = useState(1);
  const [drawn, setDrawn] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let created: StrokeRenderer | null = null;
    const el = boxRef.current;
    if (!el) return;
    strokeOrder.load(char).then(async (data) => {
      if (cancelled) return;
      if (!data) {
        setStatus("missing");
        return;
      }
      const css = getComputedStyle(document.documentElement);
      const renderer = await createHanziWriterRenderer(el, char, data, {
        size: SIZE,
        speed,
        colors: {
          stroke: css.getPropertyValue("--text").trim() || "#333",
          outline: css.getPropertyValue("--border").trim() || "#ddd",
          highlight: css.getPropertyValue("--primary").trim() || "#6a45f5",
        },
      });
      if (cancelled) return renderer.destroy();
      created = renderer;
      setRenderer(renderer);
      setTotal(renderer.strokeCount);
      setDrawn(renderer.strokeCount);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
      created?.destroy();
      setRenderer(null);
      setStatus("loading");
    };
  }, [char, speed, strokeOrder]);

  const play = () => {
    if (!r) return;
    setStatus("playing");
    setDrawn(total);
    r.play(() => setStatus((s) => (s === "playing" ? "ready" : s)));
  };
  const pauseOrResume = () => {
    if (!r) return;
    if (status === "playing") {
      r.pause();
      setStatus("paused");
    } else if (status === "paused") {
      r.resume();
      setStatus("playing");
    }
  };
  const next = async () => {
    if (!r) return;
    setStatus("ready");
    setDrawn(await r.next());
  };

  const btn =
    "h-12 min-w-12 rounded-2xl px-3 text-lg font-medium transition disabled:opacity-40";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-2xl border border-border bg-surface"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* 米字格 */}
        <svg aria-hidden className="absolute inset-0 text-border" width={SIZE} height={SIZE}>
          <g stroke="currentColor" strokeDasharray="4 4" strokeWidth="1">
            <line x1="0" y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} />
            <line x1={SIZE / 2} y1="0" x2={SIZE / 2} y2={SIZE} />
            <line x1="0" y1="0" x2={SIZE} y2={SIZE} />
            <line x1={SIZE} y1="0" x2="0" y2={SIZE} />
          </g>
        </svg>
        <div ref={boxRef} className="absolute inset-0" />
        {status === "missing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-8xl">{char}</span>
            <span className="mt-2 text-sm text-muted">暫無筆順資料</span>
          </div>
        )}
      </div>

      {status !== "missing" && (
        <>
          <p className="text-muted" aria-live="polite">
            {status === "loading" ? "載入中…" : `共 ${total} 筆${drawn < total ? `・已寫 ${drawn} 筆` : ""}`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={play} disabled={!r} className={`${btn} bg-primary text-on-primary`}>
              {status === "playing" || status === "paused" ? "🔁 重播" : "▶ 播放"}
            </button>
            <button
              type="button"
              onClick={pauseOrResume}
              disabled={status !== "playing" && status !== "paused"}
              className={`${btn} bg-surface-2`}
            >
              {status === "paused" ? "▶ 繼續" : "⏸ 暫停"}
            </button>
            <button type="button" onClick={next} disabled={!r || status === "playing"} className={`${btn} bg-surface-2`}>
              👉 下一筆
            </button>
          </div>
          <div role="radiogroup" aria-label="速度" className="flex gap-2">
            {speeds.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={speed === s.value}
                onClick={() => setSpeed(s.value)}
                className={`h-10 rounded-xl px-3 ${
                  speed === s.value ? "bg-primary-soft font-bold text-primary" : "bg-surface-2 text-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
