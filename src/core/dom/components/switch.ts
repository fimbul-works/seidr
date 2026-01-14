import type { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
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
 * @param {Map<T, () => C> | Record<string, () => C>} factories - Map or object of cases to component factories
 * @param {() => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent<Comment>} A component whose root is a Comment marker
 */
export function Switch<T, C extends SeidrComponent>(
  observable: Seidr<T>,
  factories: Map<T, () => C> | Record<string, () => C>,
  defaultCase?: () => C,
): SeidrComponent {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-switch:${uid()}`);
    let currentComponent: C | null = null;

    const update = (value: T) => {
      const parent = marker.parentNode;
      if (!parent) return;

      const caseFactory = factories instanceof Map ? factories.get(value) : (factories as any)[String(value)];

      const factory = caseFactory || defaultCase;

      if (currentComponent) {
        currentComponent.destroy();
        currentComponent = null;
      }

      if (factory && parent) {
        currentComponent = (isSeidrComponentFactory(factory) ? factory(value) : component<T>(factory)(value)) as C;
        parent.insertBefore(currentComponent.element, marker);
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
