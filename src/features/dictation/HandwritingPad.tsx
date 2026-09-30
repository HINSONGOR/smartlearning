"use client";

import { useEffect, useRef, useState } from "react";
import { useServices } from "@/hooks/useServiceQuery";
import { createHanziWriterQuiz } from "@/services/strokeOrder/HanziWriterRenderer";

const SIZE = 150;

/** 喺螢幕逐個字手寫。無筆順資料嘅字會顯示「呢個字請寫喺紙上」 */
export function HandwritingPad({ word }: { word: string }) {
  const chars = [...word];
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {chars.map((c, i) => (
        <QuizBox key={`${word}-${i}`} char={c} />
      ))}
    </div>
  );
}

function QuizBox({ char }: { char: string }) {
  const { strokeOrder } = useServices();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "writing" | "done" | "missing">("loading");
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    const el = ref.current;
    if (!el) return;
    strokeOrder.load(char).then(async (data) => {
      if (cancelled) return;
      if (!data) return setState("missing");
      const css = getComputedStyle(document.documentElement);
      const quiz = await createHanziWriterQuiz(
        el,
        char,
        data,
        {
          size: SIZE,
          colors: {
            stroke: css.getPropertyValue("--text").trim() || "#333",
            outline: css.getPropertyValue("--border").trim() || "#ddd",
            highlight: css.getPropertyValue("--primary").trim() || "#6a45f5",
          },
        },
        ({ mistakes }) => {
          setMistakes(mistakes);
          setState("done");
        },
      );
      if (cancelled) return quiz.destroy();
      destroy = quiz.destroy;
      setState("writing");
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [char, strokeOrder]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative touch-none rounded-2xl border-2 bg-surface ${
          state === "done" ? "border-success" : "border-border"
        }`}
        style={{ width: SIZE, height: SIZE }}
      >
        <svg aria-hidden className="absolute inset-0 text-border" width={SIZE} height={SIZE}>
          <g stroke="currentColor" strokeDasharray="4 4" strokeWidth="1">
            <line x1="0" y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} />
            <line x1={SIZE / 2} y1="0" x2={SIZE / 2} y2={SIZE} />
          </g>
        </svg>
        <div ref={ref} className="absolute inset-0" />
        {state === "missing" && (
          <p className="absolute inset-0 flex items-center justify-center p-3 text-center text-sm text-muted">
            呢個字請寫喺紙上
          </p>
        )}
      </div>
      <span className="h-5 text-sm text-muted">
        {state === "done" && (mistakes === 0 ? "✓ 全對" : `寫錯 ${mistakes} 次`)}
      </span>
    </div>
  );
}
