import type { Seidr } from "../../seidr.js";
import type { CleanupFunction } from "../../types.js";
import type { SeidrComponent } from "../component.js";
import type { SeidrElement } from "../element.js";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This function provides lazy component creation - the component factory function
 * is only called when the condition becomes true. When the condition becomes false,
 * the component is properly destroyed and removed from the DOM.
 *
 * @template E - The type of SeidrElement being conditionally mounted
 *
 * @param condition - Boolean observable that controls component visibility
 * @param componentFactory - Function that creates the component when needed
 * @param container - The DOM container element
 *
 * @returns A cleanup function that removes the reactive binding and any active component
 *
 * @example
 * Conditional panel display
 * ```typescript
 * import { mountConditional, Seidr, component } from '@fimbul-works/seidr';
 *
 * const isVisible = new Seidr(false);
 *
 * function DetailsPanel() {
 *   return component((scope) => {
 *     return createElement('div', { className: 'details-panel' }, [
 *       createElement('h2', { textContent: 'Details' }),
 *       createElement('p', { textContent: 'Additional information...' })
 *     ]);
 *   });
 * }
 *
 * const cleanup = mountConditional(
 *   isVisible,
 *   () => DetailsPanel(), // Only created when true
 *   document.body
 * );
 *
 * // Show panel
 * isVisible.value = true; // Creates and mounts DetailsPanel
 *
 * // Hide panel
 * isVisible.value = false; // Destroys and removes DetailsPanel
 * ```
 */
export function mountConditional<K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
  condition: Seidr<boolean>,
  componentFactory: () => SeidrComponent<K, E>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: SeidrComponent<K, E> | null = null;

  const update = (shouldShow: boolean) => {
    if (shouldShow && !currentComponent) {
      currentComponent = componentFactory();
      container.appendChild(currentComponent.element);
    } else if (!shouldShow && currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };

  // Initial render
  update(condition.value);

  // Track changes
  const unsubscribe = condition.observe(update);

  return () => {
    unsubscribe();
    if (currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };
}
