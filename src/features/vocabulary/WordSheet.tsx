"use client";

import { useEffect, useRef } from "react";
import type { Vocabulary } from "@/domain/types";
import { SpeakButton } from "@/features/speech/SpeakButton";
import { WordStrokes } from "@/features/strokeOrder/WordStrokes";

interface Props {
  word: Vocabulary | null;
  onClose: () => void;
}

/** 詞語卡：手機由底部彈出，平板／桌面喺中間 */
export function WordSheet({ word, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (word && !dialog.open) dialog.showModal();
    if (!word && dialog.open) dialog.close();
  }, [word]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-lg md:rounded-3xl max-h-[90dvh] overflow-y-auto"
    >
      {word && (
        <div className="space-y-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-5xl font-bold tracking-wide">{word.word}</p>
              {word.jyutping && <p className="mt-2 text-lg text-muted">粵拼：{word.jyutping}</p>}
              {word.pinyin && <p className="text-lg text-muted">拼音：{word.pinyin}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <SpeakButton text={word.word} lang="yue" />
            <SpeakButton text={word.word} lang="cmn" />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-lg bg-primary-soft px-2 py-1 text-primary">{word.category}</span>
            <span className="rounded-lg bg-accent-soft px-2 py-1 text-accent">程度 {word.level}</span>
          </div>
          <section>
            <h3 className="font-bold text-muted">解釋</h3>
            <p className="text-lg">{word.definition}</p>
          </section>
          {word.example && (
            <section>
              <h3 className="font-bold text-muted">例句</h3>
              <p className="text-lg">{word.example}</p>
              <div className="mt-2">
                <SpeakButton text={word.example} lang="yue" compact />
              </div>
            </section>
          )}
          <section>
            <h3 className="mb-2 font-bold text-muted">✍️ 筆順</h3>
            <WordStrokes key={word.id} word={word.word} />
          </section>
        </div>
      )}
    </dialog>
  );
}

