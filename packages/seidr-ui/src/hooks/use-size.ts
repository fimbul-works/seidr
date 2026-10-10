import { createValue, inClient, isRef, type Ref, SeidrError, type Value } from "@fimbul-works/seidr";

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
 * Creates a `Value<Size | null>` that holds the size of an element.
 *
 * @template {HTMLElement} T The type of element to observe.
 * @param {Ref<T>} ref - Ref to observe.
 * @returns {Value<Size | null>} A value that holds the size of the element.
 */
export function useSize<T extends HTMLElement>(ref: Ref<T>): Value<Size | null> {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid ref");
  }

  const size = createValue<Size | null>(null, {
    // Only trigger updates if the size actually changed
    isEqual: (a, b) => (a && b ? a.width === b.width && a.height === b.height : a === b),
    hydrate: false,
  });

  inClient(() => {
    ref.bind((element) => {
      if (element) {
        // Provide size as early as possible
        size({ width: element.offsetWidth, height: element.offsetHeight });

        let rAF = 0;

        const resizeObserver = new ResizeObserver((entries) => {
          if (!Array.isArray(entries)) {
            return;
          }

          // Since we only observe the one element, we don't need to loop over the array
          if (!entries.length) {
            return;
          }

          const entry = entries[0]!;

          window.cancelAnimationFrame(rAF);
          rAF = window.requestAnimationFrame(() => {
            if ("borderBoxSize" in entry) {
              const borderSizeEntry = entry.borderBoxSize;
              // Iron out differences between browsers
              const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
              size({ width: borderSize.inlineSize, height: borderSize.blockSize });
            } else {
              // For browsers that don't support `borderBoxSize`, calculate it ourselves to get the correct border box
              size({ width: element.offsetWidth, height: element.offsetHeight });
            }
          });
        });

        resizeObserver.observe(element, { box: "border-box" });

        return () => {
          window.cancelAnimationFrame(rAF);
          resizeObserver.disconnect();
        };
      } else {
        // We only want to reset to `null` when the element becomes `null`, not if it changes to another element.
        size(null);
      }
    });
  });

  // Return as derived state
  return size.as((s) => s);
}
