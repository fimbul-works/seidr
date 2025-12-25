import type { CleanupFunction } from "../../types.js";
import type { SeidrComponent } from "../component.js";

/**
 * Mounts a component into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * @template C - The type of SaidrElement being mounted
 *
 * @param {C} component - The component to mount
 * @param {HTMLElement} container - The DOM container element to mount the component into
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 *
 * @example
 * Basic component mounting
 * ```typescript
 * import { mount, component } from '@fimbul-works/seidr';
 *
 * const counterComponent = createCounter();
 * const unmount = mount(counterComponent, document.body);
 *
 * // Later cleanup
 * unmount(); // Removes component and cleans up all resources
 * ```
 */
export function mount<C extends SeidrComponent<any, any>>(component: C, container: HTMLElement): CleanupFunction {
  // Check if element is already in the container (happens during hydration with DOM reuse)
  const isAlreadyMounted = container.contains(component.element);

  if (!isAlreadyMounted) {
    container.appendChild(component.element);
  }

  return () => {
    component.element.remove();
    component.destroy();
  };
}
