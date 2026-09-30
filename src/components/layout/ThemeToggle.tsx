"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { applyTheme, isTheme, restoreTheme, themes, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme | null {
  const t = document.documentElement.dataset.theme;
  return isTheme(t) ? t : null;
}

/** 每撳一下轉去清單入面下一個主題 */
export function ThemeToggle() {
  // 伺服器唔知道主題，所以 server snapshot 係 null
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);

  // 開發模式 React 會重新掛載 <html> 並清走 data-theme，喺畫面出現前補返（正式版無影響）
  useLayoutEffect(() => {
    if (!getTheme()) restoreTheme();
  }, []);

  const index = themes.findIndex((t) => t.id === theme);
  const next = themes[(index + 1) % themes.length];

  return (
    <button
      type="button"
      onClick={() => applyTheme(next.id)}
      aria-label={`切換到${next.label}主題`}
      title={`切換到${next.label}主題`}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-xl transition hover:bg-surface-2"
    >
      <span aria-hidden>{theme === null ? "" : next.icon}</span>
    </button>
  );
}
