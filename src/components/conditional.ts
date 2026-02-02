import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { $fragment, clearBetween, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
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
 * @returns {SeidrComponent<SeidrFragment>} A component whose root is a SeidrFragment
 */
export function Conditional<T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
): SeidrComponent<SeidrFragment> {
  return component(() => {
    const scope = useScope();
    const ctx = getRenderContext();
    const instanceId = ctx.idCounter++;
    const id = `conditional-${ctx.ctxID}-${instanceId}`;

    const [s, e] = findMarkers(id);
    const fragment = $fragment([], id, s || undefined, e || undefined);
    // Access created markers if not found initially
    const start = (fragment as any).start as Comment;
    const end = (fragment as any).end as Comment;

    let currentComponent: SeidrComponent | null = null;

    /**
     * Updates the DOM state based on the condition.
     * @param {boolean} shouldShow - Whether the component should be visible
     */
    const update = (shouldShow: boolean) => {
      if (shouldShow && !currentComponent) {
        // Ensure clean state (though logically should be empty if currentComponent was null)
        clearBetween(start, end);

        currentComponent = wrapComponent(factory)();
        const el = currentComponent.element as any;

        // Direct insertion into DOM
        if (end.parentNode) {
          end.parentNode.insertBefore(el, end);
        }

        // Trigger onAttached
        if (end.parentNode && currentComponent.scope.onAttached) {
          currentComponent.scope.onAttached(end.parentNode);
        }
      } else if (!shouldShow && currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
        clearBetween(start, end);
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
        currentComponent.element.remove();
      }
    });

    return fragment;
  })();
}
