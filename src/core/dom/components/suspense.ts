import { Seidr } from "../../seidr";
import { isSeidr } from "../../util/is";
import { component, type SeidrComponent, useScope } from "../component";
import type { SeidrNode } from "../element";
import { Switch } from "./switch";

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
    if (isSeidr<Promise<T>>(promiseOrSeidr)) {
      scope.track(promiseOrSeidr.observe(handlePromise));
      handlePromise(promiseOrSeidr.value);
    } else {
      handlePromise(promiseOrSeidr);
    }

    return Switch(status, {
      resolved: () => factory(resolvedValue!),
      error: () => error(errorValue!),
      pending: loading,
    });
  })();
}
