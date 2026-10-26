import { isArr, isNum } from "@fimbul-works/hvat";
import {
  createValue,
  type DerivedValue,
  inClient,
  isRef,
  onUnmounted,
  type Ref,
  SeidrError,
} from "@fimbul-works/seidr";

/**
 * The size of an element.
 */
export interface Size {
  /** The width of the element. */
  width: number;
  /** The height of the element. */
  height: number;
}

/**
 * Reactive width and height values.
 */
export type SizeValue = {
  /** The width of the element. */
  width: DerivedValue<number>;
  /** The height of the element. */
  height: DerivedValue<number>;
};

/**
 * Creates reactive `width` and `height` Values tracking the dimensions of an element.
 *
 * Direct ResizeObserver observation without rAF loops.
 * Cleanups are wired directly to `onUnmounted` and `ref.bind` teardowns.
 *
 * Ported from Kobalte's createSize primitive.
 */
export function useSize<T extends HTMLElement>(ref: Ref<T>): SizeValue {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid ref");
  }

  const size = createValue<Size | null>(null, {
    isEqual: (a, b) => (a && b ? a.width === b.width && a.height === b.height : a === b),
    hydrate: false,
  });

  inClient(() => {
    const syncSize = (element: HTMLElement, entry?: ResizeObserverEntry) => {
      if (entry && "borderBoxSize" in entry && entry.borderBoxSize) {
        const borderBox = entry.borderBoxSize;
        const box = isArr(borderBox) ? borderBox[0] : (borderBox as unknown as ResizeObserverSize);
        if (box && isNum(box.inlineSize) && isNum(box.blockSize)) {
          size({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      size({ width: element.offsetWidth, height: element.offsetHeight });
    };

    ref.bind((element) => {
      if (!element) {
        size(null);
        return;
      }

      syncSize(element);

      const observer = new ResizeObserver((entries) => {
        if (!isArr(entries)) return;
        for (const entry of entries) {
          if (entry.target && entry.target !== element) continue;
          syncSize(element, entry);
        }
      });
      observer.observe(element, { box: "border-box" });

      return () => observer.disconnect();
    });
  });

  return {
    width: size.as((s) => s?.width ?? 0),
    height: size.as((s) => s?.height ?? 0),
  };
}
