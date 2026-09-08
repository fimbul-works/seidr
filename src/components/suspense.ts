import { createComponent } from "../component/create-component.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";
import type { SeidrComponent } from "../component/types.js";
import type { SeidrChild } from "../element/types.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import { createValue } from "../observable/value.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { isServer } from "../util/environment/is-server.js";
import { wrapError } from "../util/wrap-error.js";

export const PROMISE_PENDING = "pending";
export const PROMISE_RESOLVED = "resolved";
export const PROMISE_ERROR = "error";

export type SuspenseStatus = typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_ERROR;

export interface SuspenseState<T> {
  state: Value<SuspenseStatus>;
  value: Value<T | null>;
  error: Value<Error | null>;
}

/**
 * Creates a component that handles Promise resolution with reactive states.
 *
 * @template T - The resolved value type
 * @param {Promise<T> | Value<Promise<T>>} promiseOrValue - A promise or a Value emitting promises
 * @param {(state: SuspenseState<T>) => SeidrChild} factory - Render function receiving the suspense state
 * @param {string} [name="Suspense"] - Optional component name
 * @returns {SeidrComponent} A component managing the promise resolution
 */
export const Suspense = <T>(
  promiseOrValue: Promise<T> | Value<Promise<T>>,
  factory: (state: SuspenseState<T>) => SeidrChild,
  name: string = "Suspense",
): SeidrComponent =>
  createComponent(() => {
    const state = createValue<SuspenseStatus>(PROMISE_PENDING);
    const value = createValue<T | null>(null);
    const error = createValue<Error | null>(null);

    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>): Promise<void> => {
      if (!prom) return;

      const id = ++currentPromiseId;
      state(PROMISE_PENDING);

      try {
        const resolved = await prom;
        if (id === currentPromiseId) {
          value(resolved);
          state(PROMISE_RESOLVED);
        }
      } catch (err) {
        if (id === currentPromiseId) {
          error(wrapError(err));
          state(PROMISE_ERROR);
        }
      }
    };

    const initial = isValue<Promise<T>>(promiseOrValue) ? promiseOrValue() : promiseOrValue;
    if (initial instanceof Promise) {
      if (isServer()) {
        getSSRScope()?.addPromise(initial);
      }
      if (!isHydrating() || state() !== PROMISE_RESOLVED) {
        handlePromise(initial);
      }
    } else if (initial !== undefined && initial !== null) {
      value(initial as T);
      state(PROMISE_RESOLVED);
    }

    if (isValue<Promise<T>>(promiseOrValue)) {
      const cleanup = promiseOrValue.watch((prom) => {
        if (prom instanceof Promise) {
          if (isServer()) {
            getSSRScope()?.addPromise(prom);
          }
          handlePromise(prom);
        }
      });
      onUnmounted(cleanup);
    }

    return factory({ state, value, error });
  }, name)();
