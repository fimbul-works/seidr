import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { getMarkerComments } from "../dom-utils";
import type { SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import { isArr, isDOMNode } from "../util/type-guards";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {SeidrNode} C - The type of SeidrNode being rendered
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {Map<T, (val: T) => C> | Record<string, (val: T) => C>} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {(val: T) => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent} A component
 */
export function Switch<T, C extends SeidrNode>(
  observable: Seidr<T>,
  factories: Map<T, (val: T) => C> | Record<string, (val: T) => C>,
  defaultCase?: (val: T) => C,
): SeidrComponent {
  return component((_props, id) => {
    const scope = useScope();
    const markers = getMarkerComments(id);
    let currentComponent: SeidrComponent | null = null;

    const update = (value: T) => {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) return;

      const caseFactory = factories instanceof Map ? factories.get(value) : (factories as any)[String(value)];
      const factory = caseFactory || defaultCase;

      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }

      if (factory) {
        currentComponent = wrapComponent<typeof value>(factory)(value);

        if (currentComponent.start) parent.insertBefore(currentComponent.start, end);

        const el = currentComponent.element;
        if (isArr(el)) {
          el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, end));
        } else if (isDOMNode(el)) {
          parent.insertBefore(el, end);
        }

        if (currentComponent.end) parent.insertBefore(currentComponent.end, end);

        currentComponent.scope.attached(parent);
      }
    };

    scope.onAttached = () => {
      update(observable.value);
    };

    scope.track(observable.observe(update));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.unmount();
      }
    });

    return [];
  }, "switch")();
}
