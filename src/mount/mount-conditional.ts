import { type SeidrComponent, wrapComponent } from "../component";
import { createFragment, type SeidrElement, type SeidrFragment, type SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { uid } from "../util/uid";

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
 * @param {HTMLElement | SeidrElement} container - The DOM container element
 * @returns {CleanupFunction} A cleanup function that removes the reactive binding and any active component
 */
export function mountConditional<T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
  container: HTMLElement | SeidrElement,
): CleanupFunction {
  const fragment = createFragment(`mount-conditional:${uid()}`);
  if ("appendChild" in container) {
    fragment.appendTo(container as any);
  }

  let currentComponent: SeidrComponent | null = null;

  const update = (shouldShow: boolean) => {
    if (shouldShow && !currentComponent) {
      currentComponent = wrapComponent(factory)();
      fragment.appendChild(currentComponent.element as any);

      // Trigger onAttached when component is added to DOM
      if (currentComponent.scope.onAttached) {
        currentComponent.scope.onAttached(container as any);
      }
    } else if (!shouldShow && currentComponent) {
      currentComponent.destroy();
      currentComponent = null;
    }
  };

  // Initial state
  update(condition.value);

  // Reactive updates
  const cleanup = condition.observe((val) => update(val));

  // Return combined cleanup
  return () => {
    cleanup();
    if (currentComponent) {
      currentComponent.destroy();
    }
    fragment.remove();
  };
}
