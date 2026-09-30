"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Essay, Level, LevelId, QuestionType, Topic, WritingType } from "@/domain/types";
import { WordSheet } from "@/features/vocabulary/WordSheet";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { buildTerms } from "@/lib/highlight";
import { countChars } from "@/lib/text";
import { EssayView } from "./EssayView";
import { FormulaCards } from "./FormulaCards";

interface Props {
  topic: Topic;
  writingType: WritingType;
  questionType: QuestionType;
  levels: Level[];
}

const steps = ["認識題目", "寫作公式", "構思", "重點詞語", "例子", "範文"] as const;

export function TopicDetail({ topic, writingType, questionType, levels }: Props) {
  const [step, setStep] = useState(0);
  const [openWordId, setOpenWordId] = useState<string | null>(null);

  const vocabulary = useServiceQuery((s) => s.vocabulary.list(), []);
  const topicWords = useServiceQuery(
    (s) => s.vocabulary.listForTopic(topic.id, questionType.id),
    [topic.id, questionType.id],
  );
  const examples = useServiceQuery((s) => s.examples.listForTopic(topic.id), [topic.id]);
  const essays = useServiceQuery((s) => s.essays.listForTopic(topic.id), [topic.id]);

  const terms = useMemo(() => buildTerms(vocabulary ?? []), [vocabulary]);
  const openWord = vocabulary?.find((v) => v.id === openWordId) ?? null;

  return (
    <>
      <nav aria-label="學習步驟" className="-mx-4 mb-6 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex w-max gap-2">
          {steps.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={step === i ? "step" : undefined}
                className={`flex h-12 items-center gap-2 rounded-2xl px-4 font-medium transition ${
                  step === i ? "bg-primary text-on-primary" : "bg-surface text-muted hover:text-text"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    step === i ? "bg-on-primary text-primary" : "bg-surface-2"
                  }`}
                >
                  {i + 1}
                </span>
                {name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-h-[40vh]">
        {step === 0 && (
          <section className="space-y-4">
            <InfoRow label="作文類型" value={writingType.name} />
            <InfoRow
              label="題型"
              value={questionType.mnemonic ? `${questionType.name}（${questionType.mnemonic}）` : questionType.name}
            />
            {writingType.requirements && (
              <InfoRow
                label="考試要求"
                value={`最少 ${writingType.requirements.minChars} 字（不計標點）・限時 ${writingType.requirements.timeLimitMinutes} 分鐘`}
              />
            )}
            <p className="rounded-2xl bg-surface p-4 text-lg">{questionType.description}</p>
            {topic.keyConcepts.length > 0 && (
              <div>
                <h2 className="mb-2 text-xl font-bold">重點概念</h2>
                <ul className="flex flex-wrap gap-2">
                  {topic.keyConcepts.map((c) => (
                    <li key={c} className="rounded-xl bg-primary-soft px-3 py-1.5 text-lg text-primary">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="space-y-3">
            <p className="rounded-2xl bg-surface-2 p-4 text-lg font-medium">{questionType.formula}</p>
            <FormulaCards structure={questionType.structure} outline={topic.outline} />
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold">點樣諗</h2>
              <ol className="space-y-2">
                {questionType.thinkingSteps.map((s, i) => (
                  <li key={s} className="flex gap-3 rounded-2xl bg-surface p-4 text-lg">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            {topic.outline.length > 0 && (
              <div>
                <h2 className="mb-2 text-xl font-bold">本題大綱</h2>
                <ol className="space-y-2">
                  {topic.outline.map((o, i) => (
                    <li key={i} className="rounded-2xl bg-surface p-4 text-lg">
                      <span className="mr-2 font-bold text-primary">第{i + 1}段</span>
                      {o}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {topic.hints.length > 0 && (
              <div>
                <h2 className="mb-2 text-xl font-bold">構思提示</h2>
                <ul className="space-y-2">
                  {topic.hints.map((h) => (
                    <li key={h} className="rounded-2xl bg-accent-soft p-4 text-lg">
                      💡 {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted">撳詞語睇解釋、聽讀音同睇筆順</p>
              <Link
                href={`/dictation?topic=${topic.id}`}
                className="inline-flex h-12 items-center rounded-2xl bg-primary-soft px-4 font-medium text-primary"
              >
                ✏️ 默本題詞語
              </Link>
            </div>
            <Loading value={topicWords}>
              {(words) => (
                <ul className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() => setOpenWordId(w.id)}
                        className="min-h-12 rounded-2xl border border-border bg-surface px-4 py-2 text-xl font-medium transition hover:border-primary hover:bg-primary-soft"
                      >
                        {w.word}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Loading>
          </section>
        )}

        {step === 4 && (
          <Loading value={examples}>
            {(list) => (
              <ul className="grid gap-3 md:grid-cols-2">
                {list.map((ex) => (
                  <li key={ex.id} className="rounded-2xl bg-surface p-4">
                    <span className="rounded-lg bg-accent-soft px-2 py-0.5 text-sm text-accent">
                      {ex.category}
                    </span>
                    <p className="mt-2 text-lg font-bold">{ex.title}</p>
                    <p className="text-lg">{ex.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </Loading>
        )}

        {step === 5 && (
          <Loading value={essays}>
            {(list) => (
              <EssaysPanel
                essays={list}
                levels={levels}
                structure={questionType.structure}
                terms={terms}
                minChars={writingType.requirements?.minChars}
                onWordClick={setOpenWordId}
              />
            )}
          </Loading>
        )}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="h-14 rounded-2xl border border-border px-6 text-lg disabled:invisible"
        >
          ← 上一步
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          disabled={step === steps.length - 1}
          className="h-14 rounded-2xl bg-primary px-6 text-lg font-bold text-on-primary disabled:invisible"
        >
          下一步：{steps[step + 1] ?? ""} →
        </button>
      </div>

      <WordSheet word={openWord} onClose={() => setOpenWordId(null)} />
    </>
  );
}

function EssaysPanel({
  essays,
  levels,
  structure,
  terms,
  minChars,
  onWordClick,
}: {
  essays: Essay[];
  levels: Level[];
  structure: QuestionType["structure"];
  terms: ReturnType<typeof buildTerms>;
  minChars?: number;
  onWordClick: (id: string) => void;
}) {
  const available = levels.filter(
    (l) => l.status === "active" && essays.some((e) => e.level === l.id),
  );
  const upcoming = levels.filter((l) => l.status !== "active");
  const [level, setLevel] = useState<LevelId | undefined>(
    available.find((l) => l.id === "B")?.id ?? available[0]?.id,
  );
  const [recite, setRecite] = useState(false);
  const [copied, setCopied] = useState(false);
  const essay = essays.find((e) => e.level === level);

  if (!essay) return <p className="text-lg text-muted">呢條題目暫時未有範文。</p>;
  const chars = countChars(essay.content);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${essay.title}\n\n${essay.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 有啲瀏覽器唔俾複製，唔影響其他功能
    }
  };

  return (
    <section className="space-y-4">
      <div
        role="radiogroup"
        aria-label="範文程度"
        className={`grid gap-2 ${available.length + upcoming.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {available.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={level === l.id}
            onClick={() => setLevel(l.id)}
            className={`rounded-2xl border-2 p-3 text-left transition ${
              level === l.id ? "border-primary bg-primary-soft" : "border-border bg-surface"
            }`}
          >
            <span className="block text-xl font-bold">
              {l.id} {l.name}
            </span>
            <span className="hidden text-sm text-muted sm:block">{l.description}</span>
          </button>
        ))}
        {upcoming.map((l) => (
          <div key={l.id} aria-disabled className="rounded-2xl border-2 border-dashed border-border p-3 opacity-60">
            <span className="block text-xl font-bold">
              {l.id} {l.name}
            </span>
            <span className="text-sm text-muted">第二版推出</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={chars < (minChars ?? 0) ? "font-bold text-danger" : "text-muted"}>
          {chars} 字{minChars && chars < minChars ? `（未夠 ${minChars} 字）` : ""}
        </span>
        {essay.tags.includes("待審閱") && (
          <span className="rounded-lg bg-danger-soft px-2 py-0.5 text-sm text-danger">待審閱</span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setRecite((r) => !r)}
          aria-pressed={recite}
          className={`h-12 rounded-2xl px-4 font-medium ${
            recite ? "bg-primary text-on-primary" : "border border-border bg-surface"
          }`}
        >
          {recite ? "顯示全文" : "🙈 背誦模式"}
        </button>
        <button type="button" onClick={copy} className="h-12 rounded-2xl border border-border bg-surface px-4">
          {copied ? "✓ 已複製" : "📋 複製"}
        </button>
      </div>

      <EssayView
        key={`${essay.id}-${recite}`}
        essay={essay}
        structure={structure}
        terms={terms}
        recite={recite}
        onWordClick={onWordClick}
      />
      <p className="text-sm text-muted">
        <span className="rounded bg-yellow-300/40 px-1">黃底</span> 係連接詞；
        <span className="font-bold text-primary">紫色字</span> 係重點詞語，撳一下睇解釋。
      </p>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-wrap gap-x-3 text-lg">
      <span className="text-muted">{label}</span>
      <span className="font-bold">{value}</span>
    </p>
  );
}

function Loading<T>({ value, children }: { value: T | undefined; children: (v: T) => React.ReactNode }) {
  return value === undefined ? <p className="text-muted">載入中…</p> : children(value);
}
