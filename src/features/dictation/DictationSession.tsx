"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Vocabulary } from "@/domain/types";
import { SpeakButton } from "@/features/speech/SpeakButton";
import { WordStrokes } from "@/features/strokeOrder/WordStrokes";
import { WordSheet } from "@/features/vocabulary/WordSheet";
import { useServiceQuery, useServices } from "@/hooks/useServiceQuery";
import { buildDictation } from "./dictation";
import { HandwritingPad } from "./HandwritingPad";

interface Props {
  /** 由題目頁入嚟：只默呢啲題目嘅詞語 */
  topicIds?: string[];
  topicTitle?: string;
}

type Result = { word: Vocabulary; correct: boolean };

const counts = [5, 10, 0];

/** ✏️ 默書：聽讀音 → 寫 → 對答案睇筆順 → 自己打 ✓／✗。成績唔會儲存。 */
export function DictationSession({ topicIds, topicTitle }: Props) {
  const vocabulary = useServiceQuery((s) => s.vocabulary.list(), []);
  const categories = useServiceQuery((s) => s.vocabulary.listCategories(), []);
  const [category, setCategory] = useState<string>();
  const [count, setCount] = useState(10);
  const [queue, setQueue] = useState<Vocabulary[] | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const available = vocabulary ? buildDictation(vocabulary, { category, topicIds }).length : 0;

  const start = (words: Vocabulary[]) => {
    setResults([]);
    setQueue(words);
  };

  if (!vocabulary) return <p className="text-muted">載入中…</p>;

  if (queue && results.length < queue.length) {
    return (
      <DictationItem
        key={results.length}
        word={queue[results.length]}
        index={results.length}
        total={queue.length}
        onAnswer={(correct) => setResults((r) => [...r, { word: queue[r.length], correct }])}
        onQuit={() => setQueue(null)}
      />
    );
  }

  if (queue) {
    return (
      <Summary
        results={results}
        onRetryWrong={() => start(results.filter((r) => !r.correct).map((r) => r.word))}
        onRestart={() => setQueue(null)}
      />
    );
  }

  const chip = (active: boolean) =>
    `h-12 rounded-2xl px-4 text-lg font-medium ${active ? "bg-primary text-on-primary" : "bg-surface text-muted"}`;

  return (
    <section className="space-y-6">
      {topicTitle ? (
        <p className="rounded-2xl bg-primary-soft p-4 text-lg text-primary">默「{topicTitle}」嘅重點詞語</p>
      ) : (
        <div>
          <h2 className="mb-2 text-xl font-bold">默邊類詞語？</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(!category)} onClick={() => setCategory(undefined)}>
              全部
            </button>
            {categories?.map((c) => (
              <button key={c} type="button" className={chip(category === c)} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="mb-2 text-xl font-bold">默幾多個？</h2>
        <div className="flex flex-wrap gap-2">
          {counts.map((n) => (
            <button key={n} type="button" className={chip(count === n)} onClick={() => setCount(n)}>
              {n === 0 ? `全部（${available} 個）` : `${n} 個`}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={available === 0}
        onClick={() => start(buildDictation(vocabulary, { category, topicIds, count: count || undefined }))}
        className="h-16 w-full rounded-2xl bg-primary text-xl font-bold text-on-primary disabled:opacity-40 sm:w-auto sm:px-10"
      >
        {available === 0 ? "無詞語可以默" : "開始默書 →"}
      </button>
      <p className="text-sm text-muted">「不但……還……」呢類關聯詞唔會出現喺默書。成績唔會儲存。</p>
    </section>
  );
}

function DictationItem({
  word,
  index,
  total,
  onAnswer,
  onQuit,
}: {
  word: Vocabulary;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  onQuit: () => void;
}) {
  const { tts } = useServices();
  const [revealed, setRevealed] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const speak = useCallback(() => tts.speak(word.word, { lang: "yue", rate: 0.75 }), [tts, word.word]);

  // 每個新詞語自動讀一次
  useEffect(() => {
    speak();
    return () => tts.stop();
  }, [speak, tts]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">
          第 {index + 1} ／ {total} 個
        </p>
        <button type="button" onClick={onQuit} className="h-11 rounded-2xl px-3 text-muted">
          結束
        </button>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-primary transition-all" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface p-6">
        <p className="text-muted">聽讀音，寫出詞語（{[...word.word].length} 個字）</p>
        <SpeakButton text={word.word} lang="yue" />
        {!revealed && (
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setShowHint((h) => !h)} className="h-11 rounded-2xl bg-surface-2 px-4">
              💡 {showHint ? "收起提示" : "提示"}
            </button>
            <button type="button" onClick={() => setOnScreen((s) => !s)} className="h-11 rounded-2xl bg-surface-2 px-4">
              {onScreen ? "📝 改為寫喺紙上" : "✍️ 喺螢幕寫"}
            </button>
          </div>
        )}
        {showHint && !revealed && <p className="text-center text-lg">解釋：{word.definition}</p>}
        {onScreen && !revealed && <HandwritingPad word={word.word} />}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="h-16 w-full rounded-2xl bg-primary text-xl font-bold text-on-primary"
        >
          寫好喇，對答案
        </button>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl border-2 border-primary bg-surface p-6 text-center">
            <p className="text-6xl font-bold tracking-widest">{word.word}</p>
            <p className="mt-3 text-lg">{word.definition}</p>
          </div>
          <div className="rounded-3xl bg-surface p-4">
            <h3 className="mb-3 text-center font-bold text-muted">✍️ 睇吓點寫</h3>
            <WordStrokes word={word.word} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onAnswer(false)}
              className="h-16 rounded-2xl bg-danger-soft text-xl font-bold text-danger"
            >
              ✗ 默錯
            </button>
            <button
              type="button"
              onClick={() => onAnswer(true)}
              className="h-16 rounded-2xl bg-primary text-xl font-bold text-on-primary"
            >
              ✓ 默啱
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Summary({
  results,
  onRetryWrong,
  onRestart,
}: {
  results: Result[];
  onRetryWrong: () => void;
  onRestart: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const wrong = results.filter((r) => !r.correct);
  const score = results.length - wrong.length;

  return (
    <section className="space-y-6 text-center">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-on-primary">
        <p className="text-lg">默書完成</p>
        <p className="text-5xl font-bold">
          {score} ／ {results.length}
        </p>
        <p className="mt-2 text-lg">{wrong.length === 0 ? "全部默啱，好叻！🎉" : "再練習默錯嘅詞語就得！"}</p>
      </div>

      {wrong.length > 0 && (
        <div className="text-left">
          <h2 className="mb-2 text-xl font-bold">默錯嘅詞語（撳一下睇筆順）</h2>
          <ul className="flex flex-wrap gap-2">
            {wrong.map((r) => (
              <li key={r.word.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(r.word.id)}
                  className="h-12 rounded-2xl border border-danger bg-danger-soft px-4 text-xl text-danger"
                >
                  {r.word.word}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {wrong.length > 0 && (
          <button
            type="button"
            onClick={onRetryWrong}
            className="h-14 rounded-2xl bg-primary px-6 text-lg font-bold text-on-primary"
          >
            再默錯嘅詞語
          </button>
        )}
        <button type="button" onClick={onRestart} className="h-14 rounded-2xl border border-border px-6 text-lg">
          重新揀詞語
        </button>
        <Link href="/vocabulary" className="flex h-14 items-center justify-center rounded-2xl px-6 text-lg text-muted">
          返詞語庫
        </Link>
      </div>

      <WordSheet
        word={wrong.find((r) => r.word.id === openId)?.word ?? null}
        onClose={() => setOpenId(null)}
      />
    </section>
  );
}
