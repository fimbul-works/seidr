import { component, type SeidrComponent } from "../../../dom/component/component";
import { useScope } from "../../../dom/component/use-scope";
import { wrapComponent } from "../../../dom/component/wrap-component";
import { $comment, type SeidrNode } from "../../../dom/element/element";
import type { Seidr } from "../../../state/seidr";
import { uid } from "../../../util/uid";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This component uses a Marker Node (HTML Comment) to track its position in the
 * DOM without requiring a wrapper element. When the condition is met, the
 * component is created and inserted before the marker.
 *
 * @template {SeidrNode} T - The type of SeidrNode being conditionally rendered
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls visibility
 * @param {() => T} factory - Function that creates the component or element when needed
 * @returns {SeidrComponent<Comment>} A component whose root is a Comment marker
 */
export function Conditional<T extends SeidrNode>(condition: Seidr<boolean>, factory: () => T): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-conditional:${uid()}`);
    let currentComponent: SeidrComponent | null = null;

    /**
     * Updates the DOM state based on the condition.
     * @param {boolean} shouldShow - Whether the component should be visible
     */
    const update = (shouldShow: boolean) => {
      if (shouldShow && !currentComponent) {
        currentComponent = wrapComponent(factory)();
        if (marker.parentNode) {
          marker.parentNode.insertBefore(currentComponent.element, marker);

          // Trigger onAttached when component is added to DOM
          if (currentComponent.scope.onAttached) {
            currentComponent.scope.onAttached(marker.parentNode);
          }
        }
      } else if (!shouldShow && currentComponent) {
        currentComponent.destroy();
        currentComponent = null;
      }
    };

    // Initial render / attachment sync
    scope.onAttached = () => {
      update(condition.value);
    };

    // Reactive updates
    scope.track(condition.observe((val) => update(val)));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.destroy();
      }
    });

    return marker;
  })();
}
