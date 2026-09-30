import type { CharStrokeData } from "./StrokeOrderService";

/**
 * Stroke Order Renderer：將筆順資料變成動畫。
 * 只有呢個檔案會用 hanzi-writer；將來換第二個動畫 library，只需要寫另一個 renderer。
 */
export interface StrokeRenderer {
  readonly strokeCount: number;
  /** 由頭播放全部筆畫 */
  play(onDone?: () => void): void;
  pause(): void;
  resume(): void;
  /** 逐筆：畫下一筆，回傳已經畫咗幾多筆 */
  next(): Promise<number>;
  destroy(): void;
}

export interface RendererOptions {
  size: number;
  /** 1 = 正常 */
  speed: number;
  colors: { stroke: string; outline: string; highlight: string };
}

export async function createHanziWriterRenderer(
  el: HTMLElement,
  char: string,
  data: CharStrokeData,
  { size, speed, colors }: RendererOptions,
): Promise<StrokeRenderer> {
  // 只喺瀏覽器載入
  const { default: HanziWriter } = await import("hanzi-writer");
  el.innerHTML = "";
  const writer = HanziWriter.create(el, char, {
    width: size,
    height: size,
    padding: Math.round(size * 0.06),
    showOutline: true,
    showCharacter: true,
    strokeAnimationSpeed: speed,
    delayBetweenStrokes: Math.round(500 / speed),
    strokeColor: colors.stroke,
    outlineColor: colors.outline,
    highlightColor: colors.highlight,
    charDataLoader: () => data,
  });

  let drawn = 0;
  return {
    strokeCount: data.strokes.length,
    play(onDone) {
      drawn = data.strokes.length;
      writer.animateCharacter({ onComplete: () => onDone?.() });
    },
    pause() {
      writer.pauseAnimation();
    },
    resume() {
      writer.resumeAnimation();
    },
    async next() {
      if (drawn === 0 || drawn >= data.strokes.length) {
        drawn = 0;
        await writer.hideCharacter({ duration: 0 });
      }
      await writer.animateStroke(drawn);
      drawn++;
      return drawn;
    },
    destroy() {
      el.innerHTML = "";
    },
  };
}
