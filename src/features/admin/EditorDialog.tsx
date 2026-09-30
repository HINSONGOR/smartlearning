"use client";

import { useEffect, useRef } from "react";
import { buttonClass } from "@/components/ui/form";

interface Props {
  open: boolean;
  title: string;
  error?: string;
  busy?: boolean;
  onSave: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

/** 新增／編輯表單：手機全螢幕，平板／桌面喺中間 */
export function EditorDialog({ open, title, error, busy, onSave, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-text backdrop:bg-black/50 md:m-auto md:h-auto md:max-h-[90dvh] md:max-w-3xl md:rounded-3xl"
    >
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="flex h-full flex-col md:max-h-[90dvh]"
        >
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <h2 className="text-xl font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="關閉" className="h-12 w-12 rounded-2xl text-2xl">
              ×
            </button>
          </header>
          <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">{children}</div>
          <footer className="space-y-2 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {error && (
              <p role="alert" className="whitespace-pre-line text-danger">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className={buttonClass.secondary}>
                取消
              </button>
              <button type="submit" disabled={busy} className={buttonClass.primary}>
                儲存
              </button>
            </div>
          </footer>
        </form>
      )}
    </dialog>
  );
}

/** 將 zod 或其他錯誤變成中文訊息 */
export function errorMessage(err: unknown) {
  if (err && typeof err === "object" && "issues" in err && Array.isArray(err.issues)) {
    return "請檢查以下欄位：\n" + err.issues.map((i: { path: unknown[] }) => `・${fieldNames[String(i.path[0])] ?? i.path.join(".")}`).join("\n");
  }
  return "儲存失敗，請再試一次。";
}

const fieldNames: Record<string, string> = {
  title: "標題",
  content: "內容",
  word: "詞語",
  definition: "解釋",
  category: "類別",
  subjectId: "科目",
  writingTypeId: "作文類型",
  questionTypeId: "題型",
  level: "程度",
  jyutping: "粵拼",
};
