import type { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
import { uid } from "../../util/uid";
import { component, type SeidrComponent } from "../component";
import { $comment, type SeidrNode } from "../element";
import { useScope } from "../use-scope";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {SeidrNode} C - The type of SeidrNode being rendered
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {Map<T, (val: T) => C> | Record<string, (val: T) => C>} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {(val: T) => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent<Comment>} A component whose root is a Comment marker
 */
export function Switch<T, C extends SeidrNode>(
  observable: Seidr<T>,
  factories: Map<T, (val: T) => C> | Record<string, (val: T) => C>,
  defaultCase?: (val: T) => C,
): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-switch:${uid()}`);
    let currentComponent: SeidrComponent | null = null;

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
        currentComponent = (
          isSeidrComponentFactory(factory) ? factory(value) : component<T>(factory as any)(value)
        ) as SeidrComponent;
        parent.insertBefore(currentComponent.element as Node, marker);
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
