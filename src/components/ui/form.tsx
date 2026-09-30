/** 表單共用樣式：大字、大按鈕，iPad 容易撳 */
export const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg outline-none focus:border-primary";

export const buttonClass = {
  primary: "h-12 rounded-2xl bg-primary px-5 text-lg font-bold text-on-primary disabled:opacity-40",
  secondary: "h-12 rounded-2xl border border-border bg-surface px-5 text-lg",
  danger: "h-12 rounded-2xl bg-danger px-5 text-lg font-bold text-on-primary disabled:opacity-40",
  ghost: "h-11 rounded-2xl px-3 text-muted hover:bg-surface-2",
};

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-bold">{label}</span>
      {children}
      {hint && <span className="block text-sm text-muted">{hint}</span>}
    </label>
  );
}

/** 「品德、學習」或「品德,學習」→ ["品德","學習"] */
export function parseTags(text: string) {
  return [...new Set(text.split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean))];
}
