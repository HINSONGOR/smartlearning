"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { buttonClass, Field, inputClass } from "@/components/ui/form";
import { useServices } from "@/hooks/useServiceQuery";
import { createParentChallenge, PIN_PATTERN } from "@/services/admin/PinService";

const AdminContext = createContext<{ lock: () => void } | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin 只可以喺 AdminGate 入面用");
  return ctx;
}

type Mode = "enter" | "setup" | "forgot";
const noop = () => () => {};

/** 內容管理入口：要輸入 PIN。第一次用會要求設定 PIN。 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { pin } = useServices();
  const [unlocked, setUnlocked] = useState(false);
  // PIN 存喺瀏覽器，伺服器唔知道，所以 hydrate 之後先決定顯示邊個畫面
  const hasPin = useSyncExternalStore(noop, () => pin.hasPin(), () => null);
  const [chosenMode, setMode] = useState<Mode>();
  const mode = chosenMode ?? (hasPin ? "enter" : "setup");

  if (hasPin === null) return <p className="text-muted">載入中…</p>;

  if (unlocked) {
    return (
      <AdminContext.Provider value={{ lock: () => setUnlocked(false) }}>{children}</AdminContext.Provider>
    );
  }

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-3xl bg-surface p-6 md:p-8">
      <div className="text-center">
        <div aria-hidden className="text-5xl">
          🔒
        </div>
        <h1 className="mt-2 text-2xl font-bold">內容管理</h1>
        <p className="text-muted">家長專用</p>
      </div>
      {mode === "enter" && (
        <EnterPin onSuccess={() => setUnlocked(true)} onForgot={() => setMode("forgot")} />
      )}
      {mode === "setup" && <SetPin onDone={() => setUnlocked(true)} intro="第一次使用，請設定 4 至 6 位數字 PIN。" />}
      {mode === "forgot" && (
        <ForgotPin onDone={() => setUnlocked(true)} onCancel={() => setMode("enter")} />
      )}
      <p className="text-center text-xs text-muted">
        PIN 只係防止小朋友誤改內容，唔係正式保安。PIN 同修改只儲存喺呢部裝置。
      </p>
    </section>
  );
}

export function PinInput({
  value,
  onChange,
  label = "PIN",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  autoFocus?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className={`${inputClass} text-center text-3xl tracking-[0.5em]`}
      />
    </Field>
  );
}

function EnterPin({ onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void }) {
  const { pin } = useServices();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await pin.verify(value)) return onSuccess();
    setError("PIN 唔正確，請再試一次。");
    setValue("");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PinInput value={value} onChange={(v) => (setValue(v), setError(""))} autoFocus />
      {error && <p role="alert" className="text-danger">{error}</p>}
      <button type="submit" disabled={!PIN_PATTERN.test(value)} className={`${buttonClass.primary} w-full`}>
        進入
      </button>
      <button type="button" onClick={onForgot} className={`${buttonClass.ghost} w-full`}>
        忘記 PIN？
      </button>
    </form>
  );
}

function SetPin({ onDone, intro }: { onDone: () => void; intro: string }) {
  const { pin } = useServices();
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PIN_PATTERN.test(first)) return setError("PIN 要係 4 至 6 位數字。");
    if (first !== second) return setError("兩次輸入嘅 PIN 唔一樣。");
    await pin.setPin(first);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p>{intro}</p>
      <PinInput label="新 PIN" value={first} onChange={(v) => (setFirst(v), setError(""))} autoFocus />
      <PinInput label="再輸入一次" value={second} onChange={(v) => (setSecond(v), setError(""))} />
      {error && <p role="alert" className="text-danger">{error}</p>}
      <button type="submit" className={`${buttonClass.primary} w-full`}>
        設定 PIN
      </button>
    </form>
  );
}

function ForgotPin({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [challenge] = useState(() => createParentChallenge());
  const [answer, setAnswer] = useState("");
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState("");

  if (passed) return <SetPin onDone={onDone} intro="請設定新 PIN。原有內容唔會受影響。" />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(answer) === challenge.answer) return setPassed(true);
    setError("答案唔正確。");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p>家長驗證：請計出答案，然後重設 PIN。</p>
      <p className="text-center text-3xl font-bold">{challenge.question}</p>
      <input
        inputMode="numeric"
        value={answer}
        onChange={(e) => (setAnswer(e.target.value.replace(/\D/g, "")), setError(""))}
        className={`${inputClass} text-center text-2xl`}
        aria-label="答案"
        autoFocus
      />
      {error && <p role="alert" className="text-danger">{error}</p>}
      <button type="submit" disabled={!answer} className={`${buttonClass.primary} w-full`}>
        下一步
      </button>
      <button type="button" onClick={onCancel} className={`${buttonClass.ghost} w-full`}>
        返回
      </button>
    </form>
  );
}
