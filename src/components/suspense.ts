import { component, type SeidrComponent, useScope } from "../component";
import type { SeidrNode } from "../element";
import { Seidr, unwrapSeidr } from "../seidr";
import { isSeidr } from "../util/type-guards";
import { wrapError } from "../util/wrap-error";
import { Switch } from "./switch";

const PROMISE_PENDING = "pending";
const PROMISE_RESOLVED = "resolved";
const PROMISE_ERROR = "error";

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
    const status = new Seidr<"pending" | "resolved" | "error">(PROMISE_PENDING);

    let resolvedValue: T | null = null;
    let errorValue: Error | null = null;
    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>) => {
      if (!prom) return;
      status.value = PROMISE_PENDING;

      const myId = ++currentPromiseId;

      try {
        const value = await prom;
        if (!scope.isDestroyed && myId === currentPromiseId) {
          resolvedValue = value;
          status.value = PROMISE_RESOLVED;
        }
      } catch (err) {
        if (!scope.isDestroyed && myId === currentPromiseId) {
          errorValue = wrapError(err);
          status.value = PROMISE_ERROR;
        }
      }
    };

    // Track initial promise
    const initialProm = unwrapSeidr(promiseOrSeidr);
    if (initialProm) {
      scope.waitFor(handlePromise(initialProm));
    }

    // Handle reactive promise changes
    if (isSeidr<Promise<T>>(promiseOrSeidr)) {
      scope.track(
        promiseOrSeidr.observe((prom) => {
          scope.waitFor(handlePromise(prom));
        }),
      );
    }

    return Switch(status, {
      resolved: () => factory(resolvedValue!),
      error: () => error(errorValue!),
      pending: loading,
    });
  })();
}
