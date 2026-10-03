"use client";

import { useState } from "react";
import type {
  EnglishQuestion,
  EnglishWritingLesson,
  SampleLevel,
  VocabularyCategory,
  WritingFormula,
} from "@/domain/english";
import { countWords, splitParagraphs } from "@/lib/text";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** 題目下面嘅問題：純文字或者選擇題（撳選項即刻知啱唔啱） */
export function QuestionList({ questions }: { questions: EnglishQuestion[] }) {
  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <li key={i} className="rounded-2xl bg-surface p-4">
          <p className="text-lg">
            <span className="font-bold">Question {i + 1}: </span>
            {typeof q === "string" ? q : q.text}
          </p>
          {typeof q !== "string" && <Choices options={q.options} answer={q.answer} />}
        </li>
      ))}
    </ol>
  );
}

function Choices({ options, answer }: { options: string[]; answer?: string }) {
  const [picked, setPicked] = useState<string>();
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((o, i) => {
          const chosen = picked === o;
          const correct = answer !== undefined && o === answer;
          const style = !picked
            ? "border-border bg-bg"
            : correct
              ? "border-success bg-success/15 font-bold"
              : chosen
                ? "border-danger bg-danger-soft"
                : "border-border bg-bg opacity-60";
          return (
            <button
              key={o}
              type="button"
              onClick={() => setPicked(o)}
              className={`min-h-12 rounded-2xl border-2 px-3 text-left text-lg ${style}`}
            >
              {String.fromCharCode(65 + i)}. {o}
            </button>
          );
        })}
      </div>
      {picked && answer !== undefined && (
        <p role="status" className={`mt-2 font-bold ${picked === answer ? "text-success" : "text-danger"}`}>
          {picked === answer ? "✓ Correct!" : `✗ Not quite. The answer is “${answer}”.`}
        </p>
      )}
    </div>
  );
}

export function FormulaPanel({ formula }: { formula: WritingFormula }) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-bold">{formula.title}</p>
      {formula.panelGuide.length > 0 && (
        <ol className="grid gap-3 sm:grid-cols-2">
          {formula.panelGuide.map((g) => (
            <li key={g.label} className="rounded-2xl border-l-4 border-primary bg-surface p-4">
              <p className="font-bold text-primary">{g.label}</p>
              <p className="mt-1">{g.prompt}</p>
              {g.template && <p className="mt-2 rounded-xl bg-surface-2 p-3 leading-relaxed">{g.template}</p>}
            </li>
          ))}
        </ol>
      )}
      {formula.points.length > 0 && (
        <ul className="list-disc space-y-1 pl-6 text-lg">
          {formula.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const vocabularyGroups: { id: VocabularyCategory; label: string }[] = [
  { id: "common", label: "Common Words 常用詞語" },
  { id: "verb", label: "Verbs 動詞" },
  { id: "adjective", label: "Adjectives 形容詞" },
  { id: "time", label: "Time Words 時間詞" },
  { id: "connective", label: "Connectives 連接詞" },
];

export function VocabularyPanel({ vocabulary }: { vocabulary: EnglishWritingLesson["vocabulary"] }) {
  return (
    <div className="space-y-4">
      {vocabularyGroups.map((g) => {
        const words = vocabulary.filter((v) => v.category === g.id);
        if (!words.length) return null;
        return (
          <div key={g.id}>
            <h3 className="mb-2 font-bold text-muted">{g.label}</h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {words.map((w) => (
                <li key={w.word} className="rounded-2xl border border-border bg-surface p-3">
                  <p className="text-lg font-bold">{w.word}</p>
                  {w.meaning && <p className="text-sm text-muted">{w.meaning}</p>}
                  {w.example && <p className="mt-1 text-sm italic">{w.example}</p>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function SentencesPanel({ sentences }: { sentences: EnglishWritingLesson["usefulSentences"] }) {
  const categories = [...new Set(sentences.map((s) => s.category))];
  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c}>
          <h3 className="mb-1 font-bold text-muted">{c}</h3>
          <ul className="space-y-2">
            {sentences
              .filter((s) => s.category === c)
              .map((s) => (
                <li key={s.sentence} className="rounded-2xl bg-surface px-4 py-3 text-lg">
                  {s.sentence}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const levelNames: Record<SampleLevel, string> = { C: "C Basic", B: "B Standard", A: "A Advanced" };

export function SampleEssays({ samples }: { samples: EnglishWritingLesson["sampleEssays"] }) {
  const [level, setLevel] = useState<SampleLevel | undefined>(
    samples.find((s) => s.level === "B")?.level ?? samples[0]?.level,
  );
  const sample = samples.find((s) => s.level === level);
  if (!sample) return <p className="text-muted">No sample essays yet.</p>;

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Sample level" className="grid grid-cols-3 gap-2">
        {samples.map((s) => (
          <button
            key={s.level}
            type="button"
            role="radio"
            aria-checked={level === s.level}
            onClick={() => setLevel(s.level)}
            className={`h-12 rounded-2xl border-2 font-bold ${
              level === s.level ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface"
            }`}
          >
            {levelNames[s.level]}
          </button>
        ))}
      </div>
      <article className="space-y-3 rounded-2xl bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {sample.title && <h3 className="text-xl font-bold">{sample.title}</h3>}
          <span className="text-sm text-muted">{countWords(sample.content)} words</span>
          {sample.tags.includes("待審閱") && (
            <span className="rounded-lg bg-danger-soft px-2 py-0.5 text-sm text-danger">待審閱</span>
          )}
        </div>
        {splitParagraphs(sample.content).map((p, i) => (
          <p key={i} className="text-lg leading-relaxed">
            {p}
          </p>
        ))}
      </article>
    </div>
  );
}

export function StudentWriting({ initial = "" }: { initial?: string }) {
  const [text, setText] = useState(initial);
  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Write your story here…"
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg leading-relaxed outline-none focus:border-primary"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-muted">
        <span>{countWords(text)} words</span>
        <span className="text-sm">作文唔會儲存，重新整理頁面會清空。</span>
      </div>
    </div>
  );
}
