import { createComponent } from "../component/create-component.js";
import { isLazyComponent } from "../component/type-guards.js";
import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../component/types.js";
import { onUnmounted } from "../hooks/on-unmounted.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import { createValue } from "../observable/value.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { isServer } from "../util/environment/is-server.js";
import { isNullish } from "../util/type-guards.js";
import { wrapError } from "../util/wrap-error.js";
import type { LazyComponentFactory } from "./lazy.js";

export const PROMISE_PENDING = "pending";
export const PROMISE_RESOLVED = "resolved";
export const PROMISE_ERROR = "error";

/**
 * Suspense component state types.
 */
export type SuspenseStatus = typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_ERROR;

/**
 * Suspense component state.
 */
export interface SuspenseState<T> {
  /** Promise resolution state. */
  readonly state: Value<SuspenseStatus>;
  /** Promise resolved value. */
  readonly value: Value<T | null>;
  /** Promise error. */
  readonly error: Value<Error | null>;
}

/**
 * Suspense component source types.
 */
export type SuspenseSource<T> = Promise<T> | Value<Promise<T>> | LazyComponentFactory<T>;

/**
 * Creates a component that handles Promise resolution with reactive states.
 *
 * @template T - The resolved value type
 * @param {SuspenseSource<T>} promiseOrValue - A promise, a Value emitting promises, or a lazy component
 * @param {SeidrComponentFactoryOrFunction<SuspenseState<T>>} factory - Render function receiving the suspense state
 * @param {string} [name="Suspense"] - Optional component name
 * @returns {SeidrComponent} A component managing the promise resolution
 */
export const Suspense = <T>(
  promiseOrValue: SuspenseSource<T>,
  factory: SeidrComponentFactoryOrFunction<SuspenseState<T>>,
  name: string = "Suspense",
): SeidrComponent =>
  createComponent(() => {
    const state = createValue<SuspenseStatus>(PROMISE_PENDING);
    const value = createValue<T | null>(null);
    const error = createValue<Error | null>(null);

    let currentPromiseId = 0;

    const handlePromise = async (promise: Promise<T>): Promise<void> => {
      if (!promise) return;

      const id = ++currentPromiseId;
      state(PROMISE_PENDING);

      try {
        const resolved = await promise;
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

    const initial = isLazyComponent(promiseOrValue)
      ? promiseOrValue.preload()
      : isValue<Promise<T>>(promiseOrValue)
        ? promiseOrValue()
        : promiseOrValue;

    if (initial instanceof Promise) {
      if (isServer()) {
        getSSRScope()?.addPromise(initial as Promise<T>);
      }

      if (!isHydrating() || state() !== PROMISE_RESOLVED) {
        handlePromise(initial as Promise<T>);
      }
    } else if (!isNullish(initial)) {
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
