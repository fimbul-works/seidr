import type { Seidr } from "../../seidr";
import { uid } from "../../util/uid";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment } from "../element";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This component uses a Marker Node (HTML Comment) to track its position in the
 * DOM without requiring a wrapper element. When the condition is met, the
 * component is created and inserted before the marker.
 *
 * @template {SeidrComponent} C - The type of SeidrComponent being conditionally rendered
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls visibility
 * @param {() => C} componentFactory - Function that creates the component when needed
 * @returns {SeidrComponent<Comment>} A component whose root is a Comment marker
 */
export function Conditional<C extends SeidrComponent<Comment>>(
  condition: Seidr<boolean>,
  componentFactory: () => C,
): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-conditional:${uid()}`);
    let currentComponent: C | null = null;

    /**
     * Updates the DOM state based on the condition.
     * @param shouldShow - Whether the component should be visible
     */
    const update = (shouldShow: boolean) => {
      if (shouldShow && !currentComponent) {
        currentComponent = componentFactory();
        if (marker.parentNode) {
          marker.parentNode.insertBefore(currentComponent.element, marker);
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
