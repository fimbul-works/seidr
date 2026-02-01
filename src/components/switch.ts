import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { $fragment, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {SeidrNode} C - The type of SeidrNode being rendered
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {Map<T, (val: T) => C> | Record<string, (val: T) => C>} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {(val: T) => C} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent<SeidrFragment>} A component whose root is a SeidrFragment
 */
export function Switch<T, C extends SeidrNode>(
  observable: Seidr<T>,
  factories: Map<T, (val: T) => C> | Record<string, (val: T) => C>,
  defaultCase?: (val: T) => C,
): SeidrComponent<SeidrFragment> {
  return component(() => {
    const scope = useScope();
    const ctx = getRenderContext();
    const instanceId = ctx.idCounter++;
    const id = `switch-${ctx.ctxID}-${instanceId}`;

    const [s, e] = findMarkers(id);
    const fragment: SeidrFragment = $fragment([], id, s || undefined, e || undefined);

    let currentComponent: SeidrComponent | null = null;

    const update = (value: T) => {
      console.log("Switcch update", value, "has current?", !!currentComponent);
      const caseFactory = factories instanceof Map ? factories.get(value) : (factories as any)[String(value)];
      const factory = caseFactory || defaultCase;

      if (currentComponent) {
        currentComponent.element.remove();
        currentComponent = null;
      }

      fragment.clear();

      if (factory) {
        currentComponent = wrapComponent<typeof value>(factory)(value);
        fragment.appendChild(currentComponent.element as any);

        // Trigger onAttached when component is added to DOM
        if (fragment.parentNode && currentComponent.scope.onAttached) {
          currentComponent.scope.onAttached(fragment.parentNode);
        }
      }
    };

    // Initial render
    update(observable.value);

    scope.onAttached = (parent) => {
      // Re-trigger onAttached for current component if it exists
      if (currentComponent?.scope.onAttached) {
        currentComponent.scope.onAttached(parent);
      }
    };

    scope.track(observable.observe(update));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.element.remove();
      }
    });

    return fragment;
  })();
}
