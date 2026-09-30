"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/form";
import { useServices } from "@/hooks/useServiceQuery";
import { PIN_PATTERN } from "@/services/admin/PinService";
import { PinInput } from "./AdminGate";

interface Props {
  /** 要刪除嘅項目名稱；null = 關閉 */
  itemName: string | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** 刪除：第一步輸入 PIN，第二步再確認 */
export function ConfirmDeleteDialog({ itemName, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (itemName && !d.open) d.showModal();
    if (!itemName && d.open) d.close();
  }, [itemName]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl bg-surface p-0 text-text backdrop:bg-black/50"
    >
      {itemName && <Steps key={itemName} itemName={itemName} onConfirm={onConfirm} onClose={onClose} />}
    </dialog>
  );
}

function Steps({ itemName, onConfirm, onClose }: { itemName: string } & Omit<Props, "itemName">) {
  const { pin } = useServices();
  const [step, setStep] = useState<"pin" | "confirm">("pin");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checkPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await pin.verify(value)) return setStep("confirm");
    setError("PIN 唔正確。");
    setValue("");
  };

  const remove = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
    onClose();
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">刪除「{itemName}」</h2>
      {step === "pin" ? (
        <form onSubmit={checkPin} className="space-y-4">
          <p className="text-muted">第 1 步：請輸入 PIN</p>
          <PinInput value={value} onChange={(v) => (setValue(v), setError(""))} autoFocus />
          {error && <p role="alert" className="text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={buttonClass.secondary}>
              取消
            </button>
            <button type="submit" disabled={!PIN_PATTERN.test(value)} className={buttonClass.primary}>
              下一步
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-muted">第 2 步：確定要刪除？</p>
          <p className="rounded-2xl bg-danger-soft p-4 text-danger">
            刪除後呢部裝置唔會再顯示呢項內容。
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={buttonClass.secondary}>
              取消
            </button>
            <button type="button" onClick={remove} disabled={busy} className={buttonClass.danger}>
              確定刪除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
