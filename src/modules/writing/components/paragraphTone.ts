/**
 * 段落顏色：開首段灰、中間段紫、結尾段藍。
 * 公式卡同範文用同一套顏色，小朋友一眼對到邊段係邊段。
 */
export function paragraphTone(index: number, total: number) {
  if (index === 0) return { border: "border-muted", chip: "bg-surface-2 text-text" };
  if (index === total - 1) return { border: "border-accent", chip: "bg-accent-soft text-accent" };
  return { border: "border-primary", chip: "bg-primary-soft text-primary" };
}
