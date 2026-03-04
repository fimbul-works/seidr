import { component } from "../component/component";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { Seidr, unwrapSeidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isSeidr } from "../util/type-guards/is-observable";
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
    const scope = useScope();
    const status = new Seidr<SuspenseStatus>(PROMISE_PENDING, NO_HYDRATE);
    const value = new Seidr<T | null>(null, NO_HYDRATE);
    const error = new Seidr<Error | null>(null, NO_HYDRATE);

    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>): Promise<void> => {
      if (!prom || scope.isUnmounted) {
        return;
      }

      status.value = PROMISE_PENDING;
      const currentId = ++currentPromiseId;

      try {
        const resolved = await prom;
        if (currentId === currentPromiseId) {
          value.value = resolved;
          status.value = PROMISE_RESOLVED;
        }
      } catch (err) {
        if (currentId === currentPromiseId) {
          error.value = wrapError(err);
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
      scope.onUnmount(promiseOrSeidr.observe((prom) => scope.waitFor(handlePromise(prom))));
    }

    const childComponent = wrapComponent(factory)({ value, state: status, error });
    return childComponent ? scope.child(childComponent) : undefined;
  }, name ?? "Suspense")();
