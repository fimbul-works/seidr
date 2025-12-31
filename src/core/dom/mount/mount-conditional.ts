import type { Seidr } from "../../seidr";
import { getCurrentComponent, type SeidrComponent } from "../component";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This function provides lazy component creation - the component factory function
 * is only called when the condition becomes true. When the condition becomes false,
 * the component is properly destroyed and removed from the DOM.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {SeidrComponent} C - The type of SeidrComponent being conditionally mounted
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls component visibility
 * @param {() => C} componentFactory - Function that creates the component when needed
 * @param {HTMLElement} container - The DOM container element
 * @returns {(() => void)} A cleanup function that removes the reactive binding and any active component
 *
 * @example
 * Conditional panel display
 * ```typescript
 * import { $, mountConditional, Seidr, component } from '@fimbul-works/seidr';
 *
 * const isVisible = new Seidr(false);
 *
 * function DetailsPanel() {
 *   return component((scope) => {
 *     return $('div', { className: 'details-panel' }, [
 *       $('h2', { textContent: 'Details' }),
 *       $('p', { textContent: 'Additional information...' })
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
 *
 * @example
 * Automatic cleanup when used within a parent component
 * ```typescript
 * function ParentComponent() {
 *   return component((scope) => {
 *     const isVisible = new Seidr(false);
 *
 *     // Automatically tracked - no need to store cleanup!
 *     mountConditional(isVisible, () => DetailsPanel(), document.body);
 *
 *     return $('div', { textContent: 'Parent' });
 *   });
 * }
 * ```
 */
export function mountConditional<C extends SeidrComponent<any, any>>(
  condition: Seidr<boolean>,
  componentFactory: () => C,
  container: HTMLElement,
): () => void {
  let currentComponent: C | null = null;

  function update(shouldShow: boolean) {
    if (shouldShow && !currentComponent) {
      currentComponent = componentFactory();
      container.appendChild(currentComponent.element);
    } else if (!shouldShow && currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  }

  // Initial render
  update(condition.value);

  // Track changes
  const unsubscribe = condition.observe(update);

  const cleanup = () => {
    unsubscribe();
    if (currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };

  // Automatically track cleanup if called within a component's render function
  const parentComponent = getCurrentComponent();
  if (parentComponent) {
    parentComponent.scope.track(cleanup);
  }

  return cleanup;
}
