import { type SeidrComponent, wrapComponent } from "../component";
import { getCurrentComponent } from "../component/component-stack";
import type { SeidrElement, SeidrNode } from "../element";
import { isFn } from "../util/type-guards";

/**
 * Mounts a component or element factory into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * If a plain function is provided, Seidr automatically wraps it in a component.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {SeidrNode | SeidrComponent} C - The type of SeidrNode or SeidrComponent being mounted
 *
 * @param {C | (() => C)} componentOrFactory - The component instance, or a factory function (raw or wrapped)
 * @param {HTMLElement | SeidrElement} container - The DOM container element to mount into
 * @returns {() => void} A cleanup function that unmounts the component when called
 */
export function mount<C extends SeidrNode | SeidrComponent>(
  componentOrFactory: C | (() => C),
  container: HTMLElement | SeidrElement,
): () => void {
  const factory: any = isFn(componentOrFactory) ? componentOrFactory : () => componentOrFactory;

  const component: SeidrComponent = wrapComponent(factory)();

  // Check if element is already in the container (happens during hydration with DOM reuse)
  const isAlreadyMounted = container.contains(component.element as Node);

  if (!isAlreadyMounted) {
    container.appendChild(component.element as Node);
  }

  if (component.scope.onAttached) {
    component.scope.onAttached(container);
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
