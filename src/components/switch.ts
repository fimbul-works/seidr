import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentFactory, SeidrComponentFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import type { Seidr } from "../seidr";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {SeidrNode} C - The type of SeidrNode being rendered
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {Map<T, (val: T) => C> | Record<string, (val: T) => C>} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {C => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent} A component
 */
export const Switch = <
  T,
  C extends SeidrComponentFunction<T> | SeidrComponentFactory,
  M extends Map<T, C> | Record<T & string, C>,
>(
  observable: Seidr<T>,
  factories: M,
  defaultCase?: C | null,
  name?: string,
): SeidrComponent =>
  component(() => {
    /**
     * Gets the component for a given value.
     * @param {K} value The value to get the component for.
     * @returns {SeidrComponent} The component for the given value.
     */
    const getComponent = (value: T): SeidrComponent | undefined => {
      const factory =
        (factories instanceof Map ? (factories.get(value) as C) : (factories[value as keyof M] as C)) ?? defaultCase;
      if (factory) {
        return wrapComponent<T>(factory as SeidrComponentFactory<T>)(value);
      }
    };

    const scope = useScope();
    const [, endMarker] = getMarkerComments(scope.id);
    let currentComponent: SeidrComponent | undefined = getComponent(observable.value);

    const update = (value: T) => {
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      currentComponent = getComponent(value);

      if (currentComponent) {
        const parent = endMarker.parentNode;
        if (!parent) {
          return;
        }

        parent.insertBefore(currentComponent.startMarker, endMarker);

        const el = currentComponent.element;
        if (isArray(el)) {
          el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, endMarker));
        } else if (isDOMNode(el)) {
          parent.insertBefore(el, endMarker);
        }

        parent.insertBefore(currentComponent.endMarker, endMarker);

        currentComponent.scope.attached(parent);
      }
    };

    // scope.onAttached = () => update(observable.value);
    scope.track(observable.observe(update));
    scope.track(() => currentComponent?.unmount());

    return currentComponent;
  }, name ?? "Switch")();
