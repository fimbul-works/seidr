import { component } from "../component/component";
import type { SeidrComponent } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import type { SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";

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
export const Conditional = <T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
  name?: string,
): SeidrComponent =>
  component(() => {
    const scope = useScope();
    const markers = getMarkerComments(scope.id);
    let currentComponent: SeidrComponent | null = null;

    const update = (shouldShow: boolean) => {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) {
        return;
      }

      if (shouldShow && !currentComponent) {
        currentComponent = wrapComponent(factory)();

        if (currentComponent.startMarker) {
          parent.insertBefore(currentComponent.startMarker, end);
        }

        const el = currentComponent.element;
        if (isArray(el)) {
          el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, end));
        } else if (isDOMNode(el)) {
          parent.insertBefore(el, end);
        }

        if (currentComponent.endMarker) {
          parent.insertBefore(currentComponent.endMarker, end);
        }

        currentComponent.scope.attached(parent);
      } else if (!shouldShow && currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }
    };

    scope.track(condition.observe(update));
    scope.track(() => currentComponent?.unmount());
    scope.onAttached = () => update(condition.value);

    return [];
  }, name || "Conditional")();
