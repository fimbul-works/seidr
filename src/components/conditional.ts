import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import type { SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";

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
 * @returns {SeidrComponent} The component
 */
export function Conditional<T extends SeidrNode>(condition: Seidr<boolean>, factory: () => T): SeidrComponent {
  const ctx = getRenderContext();
  const id = `cond-${ctx.ctxID}-${ctx.idCounter++}`;
  return component(() => {
    const scope = useScope();
    let currentComponent: SeidrComponent | null = null;

    /**
     * Updates the DOM state based on the condition.
     * @param {boolean} shouldShow - Whether the component should be visible
     */
    const update = (shouldShow: boolean) => {
      if (shouldShow && !currentComponent) {
        currentComponent = wrapComponent(factory)();
      } else if (!shouldShow && currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }
    };

    // Initial render
    update(condition.value);

    // Ensure onAttached is propagated
    scope.onAttached = (parent) => currentComponent?.scope.onAttached?.(parent);

    scope.track(condition.observe(update));

    // Cleanup active component
    scope.track(() => {
      if (currentComponent) {
        currentComponent.unmount();
      }
    });

    return currentComponent;
  }, id)();
}
