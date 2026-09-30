import type { ParagraphPlan } from "@/domain/types";
import { paragraphTone } from "./paragraphTone";

interface Props {
  structure: ParagraphPlan[];
  /** 本題大綱：第 N 項對應第 N 段 */
  outline?: string[];
  showTemplates?: boolean;
}

/** 四段式公式卡 */
export function FormulaCards({ structure, outline = [], showTemplates = true }: Props) {
  return (
    <ol className="grid gap-3 md:grid-cols-2">
      {structure.map((p, i) => {
        const tone = paragraphTone(i, structure.length);
        return (
          <li
            key={p.label}
            className={`rounded-2xl border-l-4 bg-surface p-4 ${tone.border}`}
          >
            <span className={`inline-block rounded-lg px-2 py-0.5 text-sm font-medium ${tone.chip}`}>
              {p.label}
            </span>
            <p className="mt-2 text-xl font-bold">{p.parts.join("＋")}</p>
            {outline[i] && <p className="mt-1 text-lg text-primary">👉 {outline[i]}</p>}
            {p.remember && <p className="mt-1 text-muted">📌 記住：{p.remember}</p>}
            {showTemplates && p.template && (
              <details className="mt-3 rounded-xl bg-surface-2 px-3 py-2">
                <summary className="cursor-pointer py-1 font-medium">句式模板</summary>
                <p className="mt-2 leading-loose">{p.template}</p>
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
