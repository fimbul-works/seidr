import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { getMarkerComments } from "../dom-utils";
import type { SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import { isArr, isDOMNode } from "../util/type-guards";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * @template {SeidrNode} T - The type of SeidrNode being conditionally rendered
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls visibility
 * @param {() => T} factory - Function that creates the component or element when needed
 * @param {string} name - Optional name for the component
 * @returns {SeidrComponent} The component
 */
export function Conditional<T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
  name?: string,
): SeidrComponent {
  return component((_props, id) => {
    const scope = useScope();
    const markers = getMarkerComments(id);
    let currentComponent: SeidrComponent | null = null;

    const update = (shouldShow: boolean) => {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) return;

      if (shouldShow && !currentComponent) {
        currentComponent = wrapComponent(factory)();

        if (currentComponent.start) parent.insertBefore(currentComponent.start, end);

        const el = currentComponent.element;
        if (isArr(el)) {
          el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, end));
        } else if (isDOMNode(el)) {
          parent.insertBefore(el, end);
        }

        if (currentComponent.end) parent.insertBefore(currentComponent.end, end);

        currentComponent.scope.attached(parent);
      } else if (!shouldShow && currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }
    };

    scope.onAttached = () => {
      update(condition.value);
    };

    scope.track(condition.observe(update));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.unmount();
      }
    });

    return [];
  }, name || "conditional")();
}
