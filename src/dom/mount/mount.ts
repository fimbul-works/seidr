import type { CleanupFunction } from "../../types.js";
import type { SeidrComponent } from "../component.js";
import type { SeidrElement } from "../element.js";
import { incrIdCounter } from "../render-context.js";

/**
 * Mounts a component into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * @template E - The type of SeidrElement being mounted
 *
 * @param component - The component to mount
 * @param container - The DOM container element to mount the component into
 *
 * @returns A cleanup function that unmounts the component when called
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
  const isRootComponent = !(container as SeidrElement).isSeidrElement;

  // Check if element is already in the container (happens during hydration with DOM reuse)
  const isAlreadyMounted = container.contains(component.element);

  if (!isAlreadyMounted) {
    // Increment ID counter for HTMLElement containers
    if (!isRootComponent) {
      incrIdCounter();
    }

    container.appendChild(component.element);
  }

  return () => {
    component.element.remove();
    component.destroy();
  };
}
