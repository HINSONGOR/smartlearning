"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { EnglishWritingLesson } from "@/domain/english";
import { basePath } from "@/lib/basePath";

type Picture = EnglishWritingLesson["pictures"][number];

const src = (p: Picture) => `${basePath}/${p.imageUrl.replace(/^\//, "")}`;

/** 四格圖：2×2 排列，圖片唔裁切（object-contain），撳一下放大 */
export function PictureGrid({ pictures }: { pictures: Picture[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="rounded-3xl border border-border bg-surface p-2 sm:p-3">
        <ol className={`grid gap-2 sm:gap-3 ${pictures.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {pictures.map((p, i) => (
            <li key={p.imageUrl}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`放大 Picture ${i + 1}`}
                className="group block w-full text-left"
              >
                <span className="relative block aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-white">
                  <Image
                    src={src(p)}
                    alt={p.caption ?? `Picture ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-contain"
                  />
                </span>
                <span className="mt-1 block text-center text-sm text-muted group-hover:text-primary">
                  🔍 Picture {i + 1}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Lightbox pictures={pictures} index={open} onChange={setOpen} />
    </>
  );
}

function Lightbox({
  pictures,
  index,
  onChange,
}: {
  pictures: Picture[];
  index: number | null;
  onChange: (i: number | null) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const picture = index !== null ? pictures[index] : null;

  return (
    <dialog
      ref={ref}
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      className="m-auto h-dvh max-h-none w-full max-w-none bg-black p-0 backdrop:bg-black"
    >
      {picture && index !== null && (
        <div className="flex h-full flex-col p-3">
          <div className="flex items-center justify-between text-white">
            <span className="text-lg font-bold">Picture {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="關閉"
              className="h-12 w-12 rounded-2xl bg-white/15 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="relative flex-1" onClick={() => onChange(null)}>
            <Image src={src(picture)} alt={picture.caption ?? `Picture ${index + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 text-white">
            <button
              type="button"
              onClick={() => onChange(index - 1)}
              disabled={index === 0}
              className="h-12 rounded-2xl bg-white/15 px-4 disabled:invisible"
            >
              ← Picture {index}
            </button>
            {picture.caption && <p className="text-center">{picture.caption}</p>}
            <button
              type="button"
              onClick={() => onChange(index + 1)}
              disabled={index === pictures.length - 1}
              className="h-12 rounded-2xl bg-white/15 px-4 disabled:invisible"
            >
              Picture {index + 2} →
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
