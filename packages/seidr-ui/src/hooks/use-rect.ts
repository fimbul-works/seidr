import { createValue, inClient, isRef, type Ref, SeidrError, type Value } from "@fimbul-works/seidr";

/**
 * An object with a getBoundingClientRect method.
 */
export type Measurable = { getBoundingClientRect(): DOMRect };

/**
 * Callback function for rect observation.
 */
export type RectCallbackFn = (rect: DOMRect) => void;

type ObservedData = {
  rect: DOMRect;
  callbacks: Array<RectCallbackFn>;
};

let rafId = 0;
const observedElements = new Map<Measurable, ObservedData>();

/**
 * Runs the observation loop.
 * @internal
 */
function runLoop() {
  const changedRectsData: Array<ObservedData> = [];

  // Process all DOM reads first (getBoundingClientRect)
  observedElements.forEach((data, element) => {
    const newRect = element.getBoundingClientRect();

    // Gather all the data for elements whose rects have changed
    if (!rectEquals(data.rect, newRect)) {
      data.rect = newRect;
      changedRectsData.push(data);
    }
  });

  // Group DOM writes here after the DOM reads (getBoundingClientRect)
  // as DOM writes will most likely happen with the callbacks
  changedRectsData.forEach((data) => {
    data.callbacks.forEach((callback) => callback(data.rect));
  });

  if (observedElements.size > 0 && typeof window !== "undefined") {
    rafId = window.requestAnimationFrame(runLoop);
  }
}

/**
 * Returns whether two rects are equal in values.
 *
 * @param rect1 - First rect
 * @param rect2 - Second rect
 * @returns true if rects are equal in values
 */
function rectEquals(rect1?: DOMRect | Partial<DOMRect> | null, rect2?: DOMRect | Partial<DOMRect> | null): boolean {
  if (!rect1 || !rect2) {
    return rect1 === rect2;
  }

  return (
    rect1.width === rect2.width &&
    rect1.height === rect2.height &&
    rect1.top === rect2.top &&
    rect1.right === rect2.right &&
    rect1.bottom === rect2.bottom &&
    rect1.left === rect2.left
  );
}

/**
 * Observes an element's rectangle on screen (getBoundingClientRect).
 * Batches DOM reads and callback writes using requestAnimationFrame.
 *
 * @param elementToObserve - The element whose rect to observe.
 * @param callback - The callback called when the rect changes.
 * @returns A cleanup function to unobserve.
 */
function observeElementRect(elementToObserve: Measurable, callback: RectCallbackFn): () => void {
  const observedData = observedElements.get(elementToObserve);

  if (!observedData) {
    // Add the element to the map of observed elements with its first callback
    // because this is the first time this element is observed
    observedElements.set(elementToObserve, { rect: {} as DOMRect, callbacks: [callback] });

    if (observedElements.size === 1) {
      // Start the internal loop once at least 1 element is observed
      rafId = window.requestAnimationFrame(runLoop);
    }
  } else {
    // Only add a callback for this element as it's already observed
    observedData.callbacks.push(callback);
  }

  return () => {
    const observedData = observedElements.get(elementToObserve);
    if (!observedData) {
      return;
    }

    // Start by removing the callback
    const index = observedData.callbacks.indexOf(callback);
    if (index > -1) {
      observedData.callbacks.splice(index, 1);
    }

    if (observedData.callbacks.length === 0) {
      // Stop observing this element because there are no
      // callbacks registered for it anymore
      observedElements.delete(elementToObserve);

      if (observedElements.size === 0) {
        // Stop the internal loop once no elements are observed anymore
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };
}

/**
 * Creates a `Value<DOMRect | null>` that holds the bounding client rect of an element.
 *
 * @template {Measurable} T The type of measurable element to observe.
 * @param {Ref<T>} ref - Ref to observe.
 * @returns {Value<DOMRect | null>} A value that holds the rect of the element.
 */
export function useRect<T extends Measurable>(ref: Ref<T>): Value<DOMRect | null> {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid ref");
  }

  const rect = createValue<DOMRect | null>(null, {
    // Only trigger updates if the rect actually changed
    isEqual: rectEquals,
    hydrate: false,
  });

  inClient(() => {
    ref.bind((element) => {
      if (element) {
        // Provide rect as early as possible
        rect(element.getBoundingClientRect());

        return observeElementRect(element, rect);
      } else {
        // We only want to reset to `null` when the element becomes `null`, not if it changes to another element.
        rect(null);
      }
    });
  });

  // Return as derived state
  return rect.as((r) => r);
}

/**
 * Clears all observed elements and stops the loop.
 * @internal Used for testing purposes.
 */
export function clearObservedElements(): void {
  observedElements.clear();
  if (typeof window !== "undefined" && rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
}
