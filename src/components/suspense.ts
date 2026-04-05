import { component } from "../component/component";
import { useScope } from "../component/use-scope";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { wrapComponent } from "../component/wrap-component";
import { Seidr, unwrapSeidr } from "../seidr";
import { isHydrating } from "../ssr/hydrate/storage";
import { getSSRScope } from "../ssr/ssr-scope";
import { isServer } from "../util/environment/is-server";
import { isSeidr } from "../util/type-guards/obserbable-types";
import { wrapError } from "../util/wrap-error";

const PROMISE_PENDING = "pending";
const PROMISE_RESOLVED = "resolved";
const PROMISE_ERROR = "error";

export type SuspenseStatus = typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_ERROR;

export interface SuspenseState<T> {
  value: Seidr<T | null>;
  state: Seidr<SuspenseStatus>;
  error: Seidr<Error | null>;
}

/**
 * Creates a component that handles Promise resolution with reactive states.
 *
 * @template T - The type of resolved value
 *
 * @param {Promise<T> | Seidr<Promise<T>>} promiseOrSeidr - The promise to wait for, or a Seidr emitting promises
 * @param {ComponentFactoryFunction<SuspenseState<T>>} factory - Function that creates the component
 * @param {string} [name] - Optional name for the component
 * @returns {Component} A component handling the promise state
 */
export const Suspense = <T>(
  promiseOrSeidr: Promise<T> | Seidr<Promise<T>>,
  factory: ComponentFactoryFunction<SuspenseState<T>>,
  name?: string,
): Component =>
  component(() => {
    const suspenseComponent = useScope();
    const suspenseId = suspenseComponent.id;
    const state = new Seidr<SuspenseStatus>(PROMISE_PENDING, { id: `${suspenseId}.state` });
    const value = new Seidr<T | null>(null, { id: `${suspenseId}.value` });
    const error = new Seidr<Error | null>(null, { id: `${suspenseId}.error` });
    const shouldTrack = !process.env.CORE_DISABLE_SSR && isServer();

    let currentPromiseId = 0;

    const handlePromise = async (currentPromise: Promise<T>): Promise<void> => {
      if (!currentPromise) {
        return;
      }

      const isHydratingNow = !process.env.CORE_DISABLE_SSR && !isServer() && isHydrating();

      if (!process.env.CORE_DISABLE_SSR && !getSSRScope()?.isStable && !isHydratingNow) {
        state.value = PROMISE_PENDING;
      }
      const currentId = ++currentPromiseId;

      try {
        const resolved = await currentPromise;
        if (currentId === currentPromiseId) {
          value.value = resolved;
          state.value = PROMISE_RESOLVED;
        }
      } catch (err) {
        if (currentId === currentPromiseId) {
          error.value = wrapError(err);
          state.value = PROMISE_ERROR;
        }
      }
    };

    // Track initial promise
    const initialProm = unwrapSeidr(promiseOrSeidr);
    if (initialProm) {
      // Check if it's already resolved in the state (for hydration)
      if (initialProm instanceof Promise) {
        handlePromise(shouldTrack ? getSSRScope()?.addPromise(initialProm) ?? initialProm : initialProm);
      } else {
        // Already a value, resolve synchronously
        value.value = initialProm;
        state.value = PROMISE_RESOLVED;
      }
    }

    // Handle reactive promise changes
    if (isSeidr<Promise<T>>(promiseOrSeidr)) {
      suspenseComponent.onUnmount(promiseOrSeidr.observe((prom) => handlePromise(shouldTrack ? getSSRScope()?.addPromise(prom) ?? prom : prom)));
    }

    return suspenseComponent.addChild(wrapComponent(factory)({ state, value, error }, suspenseComponent));
  }, name || "Suspense")();
