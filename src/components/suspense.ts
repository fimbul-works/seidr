import { NO_HYDRATE } from "../seidr/constants";
import { component } from "../component/component";
import { getMarkerComments } from "../component/get-marker-comments";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { getComponent, mountComponent } from "../component/util";
import { Seidr, unwrapSeidr } from "../seidr";
import { isSeidr } from "../util/type-guards/is-observable";
import { wrapError } from "../util/wrap-error";

const PROMISE_PENDING = "pending";
const PROMISE_RESOLVED = "resolved";
const PROMISE_ERROR = "error";

type SuspenseStatus = typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_ERROR;

/**
 * Creates a component that handles Promise resolution with loading and error states.
 *
 * @template T - The type of resolved value
 * @template {ComponentFactoryFunction<T>} C - The type of component factory
 *
 * @param {Promise<T> | Seidr<Promise<T>>} promiseOrSeidr - The promise to wait for, or a Seidr emitting promises
 * @param {C} factory - Function that creates the component when promise resolves
 * @param {ComponentFactoryFunction} [loadingFactory] - Optional loading component
 * @param {ComponentFactoryFunction<Error>} [errorBoundaryFactory] - Optional error handler component
 * @returns {Component} A component handling the promise state
 */
export const Suspense = <T, C extends ComponentFactoryFunction<T> = ComponentFactoryFunction<T>>(
  promiseOrSeidr: Promise<T> | Seidr<Promise<T>>,
  factory: C,
  loadingFactory: ComponentFactoryFunction = () => "Loading...",
  errorBoundaryFactory: ComponentFactoryFunction<Error> = (err: Error) => `${err.name}: ${err.message}`,
  name?: string,
): Component =>
  component(() => {
    const scope = useScope();
    const status = new Seidr<SuspenseStatus>(PROMISE_PENDING, NO_HYDRATE);
    const [, endMarker] = getMarkerComments(scope.id);

    let resolvedValue: T | null = null;
    let errorValue: Error | null = null;
    let currentPromiseId = 0;

    const factories: Record<SuspenseStatus, ComponentFactoryFunction<any>> = {
      [PROMISE_RESOLVED]: () => factory(resolvedValue!),
      [PROMISE_ERROR]: () => errorBoundaryFactory(errorValue!),
      [PROMISE_PENDING]: loadingFactory,
    };

    let currentComponent: Component | undefined = getComponent(factories, status.value);

    /**
     * Handles a promise and updates the status accordingly.
     *
     * @param {Promise<T>} prom The promise to handle.
     * @returns {Promise<void>} A promise that resolves when the status has been updated.
     */
    const handlePromise = async (prom: Promise<T>): Promise<void> => {
      if (!prom || scope.isDestroyed) {
        return;
      }

      status.value = PROMISE_PENDING;
      const currentId = ++currentPromiseId;

      try {
        const value = await prom;
        if (currentId === currentPromiseId) {
          resolvedValue = value;
          status.value = PROMISE_RESOLVED;
        }
      } catch (err) {
        if (currentId === currentPromiseId) {
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
      scope.track(promiseOrSeidr.observe((prom) => scope.waitFor(handlePromise(prom))));
    }

    /**
     * Updates the component based on promise status.
     *
     * @param {SuspenseStatus} status - The new value to update the component with.
     */
    const update = (status: SuspenseStatus) => {
      // Unmount previous component
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      // Mount new component
      currentComponent = getComponent(factories, status);
      if (currentComponent) {
        mountComponent(currentComponent, endMarker);
      }
    };

    scope.observe(status, update);
    scope.track(() => currentComponent?.unmount());

    return currentComponent;
  }, name ?? "Suspense")();
