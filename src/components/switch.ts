import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentFactory, SeidrComponentFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import type { Seidr } from "../seidr";
import { getComponent, insertComponent } from "./util";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {SeidrComponentFunction<T> | SeidrComponentFactory<T>} C - The type of component factory
 * @template {Map<T, C> | Record<T & string, C>} M - The type of the factories map or object
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {M} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {C | null | undefined} [fallbackFactory] - Optional fallback component factory
 * @returns {SeidrComponent} A component
 */
export const Switch = <
  T,
  C extends SeidrComponentFunction<T> | SeidrComponentFactory<T> = SeidrComponentFunction<T> | SeidrComponentFactory<T>,
  M extends Map<T, C> | Record<T & string, C> = Map<T, C> | Record<T & string, C>,
>(
  observable: Seidr<T>,
  factories: M,
  fallbackFactory?: C | null,
  name?: string,
): SeidrComponent =>
  component(() => {
    const scope = useScope();
    let currentComponent: SeidrComponent | undefined = getComponent(factories, observable.value, fallbackFactory);

    /**
     * Updates the component based on the new value.
     *
     * @param {T} value - The new value to update the component with.
     */
    const update = (value: T) => {
      // Unmount previous component
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      currentComponent = getComponent(factories, value, fallbackFactory);
      if (currentComponent) {
        insertComponent(scope.id, currentComponent);
      }
    };

    scope.track(observable.observe(update));
    scope.track(() => currentComponent?.unmount());

    return currentComponent;
  }, name ?? "Switch")();
