import { getCurrentComponent, type SeidrComponent } from "../component";

/**
 * Mounts a component into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {SeidrComponent} C - The type of SeidrComponent being mounted
 *
 * @param {C} component - The component to mount
 * @param {HTMLElement} container - The DOM container element to mount the component into
 * @returns {() => void} A cleanup function that unmounts the component when called
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
 *
 * @example
 * Automatic cleanup when mounted within a parent component
 * ```typescript
 * import { mount, component, $ } from '@fimbul-works/seidr';
 *
 * function ParentComponent() {
 *   return component((scope) => {
 *     const child = createChildComponent();
 *
 *     // Mount is automatically tracked - no need to store cleanup function!
 *     mount(child, document.body);
 *
 *     return $('div', { textContent: 'Parent' });
 *   });
 * }
 *
 * // When ParentComponent is destroyed, child component is automatically unmounted
 * ```
 */
export function mount<C extends SeidrComponent<any, any>>(component: C, container: HTMLElement): () => void {
  // Check if element is already in the container (happens during hydration with DOM reuse)
  const isAlreadyMounted = container.contains(component.element);

  if (!isAlreadyMounted) {
    container.appendChild(component.element);
  }

  if (component.onAttached) {
    component.onAttached(container);
  }

  const cleanup = () => {
    component.destroy();
  };

  // Automatically track cleanup if called within a component's render function
  const parentComponent = getCurrentComponent();
  if (parentComponent) {
    parentComponent.scope.track(cleanup);
  }

  return cleanup;
}
