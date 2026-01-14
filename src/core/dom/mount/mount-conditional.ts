import type { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
import { component, type SeidrComponent } from "../component";
import { $comment, type SeidrNode } from "../element";

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
 */
export function mountConditional<T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
  container: HTMLElement,
): () => void {
  const marker = $comment("mount-conditional-marker");
  container.appendChild(marker);

  let currentComponent: SeidrComponent | null = null;

  const update = (shouldShow: boolean) => {
    if (shouldShow && !currentComponent) {
      currentComponent = (isSeidrComponentFactory(factory) ? factory() : component(factory as any)()) as SeidrComponent;
      container.insertBefore(currentComponent.element, marker);
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
    if (container.contains(marker)) {
      container.removeChild(marker);
    }
  };
}
