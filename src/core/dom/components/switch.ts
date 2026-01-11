import type { Seidr } from "../../seidr";
import { uid } from "../../util/uid";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment } from "../element";

/**
 * Renders a component based on a value matching a specific case.
 *
 * @template T - The type of the observable value
 * @template {SeidrComponent} C - The type of SeidrComponent being rendered
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {Map<T, () => C> | Record<string, () => C>} cases - Map or object of cases to components
 * @param {() => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent<any, Comment>} A component whose root is a Comment marker
 */
export function Switch<T, C extends SeidrComponent<any, any>>(
  observable: Seidr<T>,
  cases: Map<T, () => C> | Record<string, () => C>,
  defaultCase?: () => C,
): SeidrComponent<any, Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-switch:${uid()}`);
    let currentComponent: C | null = null;

    const update = (value: T) => {
      const parent = marker.parentNode;
      if (!parent) return;

      const factory = cases instanceof Map ? cases.get(value) : (cases as any)[String(value)];

      const finalFactory = factory || defaultCase;

      if (currentComponent) {
        currentComponent.destroy();
        currentComponent = null;
      }

      if (finalFactory && parent) {
        const comp = finalFactory();
        currentComponent = comp;
        parent.insertBefore(comp.element, marker);
      }
    };

    scope.onAttached = () => {
      update(observable.value);
    };

    scope.track(observable.observe(update));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.destroy();
      }
    });

    return marker;
  })();
}
