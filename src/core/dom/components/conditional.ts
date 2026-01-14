import type { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
import { uid } from "../../util/uid";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment, type SeidrNode } from "../element";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This component uses a Marker Node (HTML Comment) to track its position in the
 * DOM without requiring a wrapper element. When the condition is met, the
 * component is created and inserted before the marker.
 *
 * @template {SeidrComponent} T - The type of SeidrComponent being conditionally rendered
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls visibility
 * @param {() => T} factory - Function that creates the component when needed
 * @returns {SeidrComponent<Comment>} A component whose root is a Comment marker
 */
export function Conditional<T extends SeidrNode>(condition: Seidr<boolean>, factory: () => T): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-conditional:${uid()}`);
    let currentComponent: SeidrComponent | null = null;

    /**
     * Updates the DOM state based on the condition.
     * @param shouldShow - Whether the component should be visible
     */
    const update = (shouldShow: boolean) => {
      if (shouldShow && !currentComponent) {
        currentComponent = (
          isSeidrComponentFactory(factory) ? factory() : component(factory as any)()
        ) as SeidrComponent;
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
