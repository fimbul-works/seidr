import { Seidr } from "../../seidr";
import { isSeidr } from "../../util/is";
import { component, type SeidrComponent } from "../component";
import type { SeidrNode } from "../element";
import { useScope } from "../use-scope";
import { Switch } from "./switch";

/**
 * Creates a component that handles Promise resolution with loading and error states.
 *
 * @template T - The type of resolved value
 * @template {SeidrNode} R - The type of element the component returns
 *
 * @param {Promise<T> | Seidr<Promise<T>>} promiseOrSeidr - The promise to wait for, or a Seidr emitting promises
 * @param {(value: T) => R} factory - Function that creates the component when promise resolves
 * @param {() => SeidrNode} [loading] - Optional loading component
 * @param {(error: Error) => SeidrNode} [error] - Optional error handler component
 * @returns {SeidrComponent} A component handling the promise state
 */
export function Suspense<T, R extends SeidrNode>(
  promiseOrSeidr: Promise<T> | Seidr<Promise<T>>,
  factory: (value: T) => R,
  loading: () => SeidrNode = () => "Loading...",
  error: (err: Error) => SeidrNode = (err) => `Error: ${err.message}`,
): SeidrComponent {
  return component(() => {
    const scope = useScope();
    const status = new Seidr<"pending" | "resolved" | "error">("pending");

    let resolvedValue: T | null = null;
    let errorValue: Error | null = null;
    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>) => {
      // Register with scope for SSR waiting
      scope.waitFor(prom);

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
