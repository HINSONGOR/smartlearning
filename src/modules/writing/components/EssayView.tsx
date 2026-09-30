"use client";

import { useState } from "react";
import type { Essay, ParagraphPlan } from "@/domain/types";
import { highlight, type Segment } from "@/lib/highlight";
import { splitParagraphs } from "@/lib/text";
import { paragraphTone } from "./paragraphTone";

interface Props {
  essay: Essay;
  structure: ParagraphPlan[];
  terms: Parameters<typeof highlight>[1];
  recite: boolean;
  onWordClick: (vocabId: string) => void;
}

/** 範文：每段按公式上色，連接詞標黃，詞語可以撳。背誦模式會遮住內文，逐段撳開。 */
export function EssayView({ essay, structure, terms, recite, onWordClick }: Props) {
  const paragraphs = splitParagraphs(essay.content);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const labelFor = (i: number) => {
    if (essay.paragraphLabels?.[i]) return essay.paragraphLabels[i];
    const plan = structure[i];
    return plan ? `${plan.label}｜${plan.parts.join("＋")}` : `第${i + 1}段`;
  };

  return (
    <div className="space-y-3">
      {paragraphs.map((text, i) => {
        const tone = paragraphTone(i, paragraphs.length);
        const hidden = recite && !revealed.has(i);
        return (
          <section key={i} className={`rounded-2xl border-l-4 bg-surface p-4 md:p-5 ${tone.border}`}>
            <span className={`inline-block rounded-lg px-2 py-0.5 text-sm font-medium ${tone.chip}`}>
              {labelFor(i)}
            </span>
            {hidden ? (
              <button
                type="button"
                onClick={() => setRevealed((s) => new Set(s).add(i))}
                className="mt-2 block w-full rounded-xl border border-dashed border-border py-6 text-lg text-muted"
              >
                背完？撳一下睇答案
              </button>
            ) : (
              <p className="mt-2 text-lg leading-loose md:text-xl">
                {highlight(text, terms).map((seg, j) => (
                  <SegmentView key={j} seg={seg} onWordClick={onWordClick} />
                ))}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SegmentView({ seg, onWordClick }: { seg: Segment; onWordClick: (id: string) => void }) {
  if (seg.kind === "plain") return seg.text;
  const style =
    seg.kind === "connector"
      ? "rounded bg-yellow-300/40 px-0.5"
      : "font-bold text-primary underline decoration-dotted underline-offset-4";
  return (
    <button type="button" onClick={() => onWordClick(seg.vocabId)} className={style}>
      {seg.text}
    </button>
  );
}
