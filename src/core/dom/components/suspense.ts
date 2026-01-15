import { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
import { uid } from "../../util/uid";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment, type SeidrNode } from "../element";

/**
 * Creates a component that handles Promise resolution with loading and error states.
 *
 * @template T - The type of resolved value
 * @template {SeidrNode} R - The type of element the component returns
 *
 * @param {Promise<T> | Seidr<Promise<T>>} promiseOrSeidr - The promise to wait for, or a Seidr emitting promises
 * @param {(value: T) => R} factory - Function that creates the component when promise resolves
 * @param {() => SeidrNode} loading - Loading component
 * @param {(error: Error) => SeidrNode} error - Error handler component
 * @returns {SeidrComponent} A component handling the promise state
 */
export function Suspense<T, R extends SeidrNode>(
  promiseOrSeidr: Promise<T> | Seidr<Promise<T>>,
  factory: (value: T) => R,
  loading: () => SeidrNode,
  error: (err: Error) => SeidrNode,
): SeidrComponent {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-suspense:${uid()}`);
    let currentComponent: SeidrComponent | null = null;

    // State to track promise status
    const status = new Seidr<"pending" | "resolved" | "error">("pending");

    // We store the resolved value/error
    let resolvedValue: T | null = null;
    let errorValue: Error | null = null;

    // Helper to handle a promise instance
    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>) => {
      // Reset state for new promise (show loading)
      status.value = "pending";

      const myId = ++currentPromiseId;

      try {
        const value = await prom;
        if (!scope.isDestroyed && myId === currentPromiseId) {
          resolvedValue = value;
          status.value = "resolved";
        }
      } catch (err) {
        if (!scope.isDestroyed && myId === currentPromiseId) {
          errorValue = err instanceof Error ? err : new Error(String(err));
          status.value = "error";
        }
      }
    };

    // Initialize
    if (promiseOrSeidr instanceof Seidr) {
      scope.track(promiseOrSeidr.observe(handlePromise));
      handlePromise(promiseOrSeidr.value);
    } else {
      handlePromise(promiseOrSeidr);
    }

    // Update logic
    const update = () => {
      if (currentComponent) {
        currentComponent.destroy();
        currentComponent = null;
      }

      const parent = marker.parentNode;
      if (!parent) return; // Should be attached

      let newContent: SeidrNode;

      if (status.value === "error") {
        // Error State
        newContent = error(errorValue!);
      } else if (status.value === "resolved") {
        // Resolved State
        newContent = factory(resolvedValue!);
      } else {
        // Loading State
        newContent = loading();
      }

      // Create component wrapping the content
      // We wrap it to ensure we get a SeidrComponent we can destroy
      // Actually, factory might return a Node or a String.
      // If it's pure node, we should wrap it or just append it and track it.
      // Reusing 'component' wrapper handles this normalization.
      currentComponent = (
        isSeidrComponentFactory(() => newContent) ? (() => newContent)() : component(() => newContent as any)()
      ) as SeidrComponent;

      parent.insertBefore(currentComponent.element, marker);
    };

    // Initial render
    scope.onAttached = () => update();

    // React to changes
    scope.track(status.observe(() => update()));

    // Cleanup
    scope.track(() => {
      if (currentComponent) currentComponent.destroy();
    });

    return marker;
  })();
}
