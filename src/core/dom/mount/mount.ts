import { isSeidrComponent, isSeidrComponentFactory } from "../../util/is";
import { component as createComponent, getCurrentComponent, type SeidrComponent } from "../component";
import type { SeidrNode } from "../element";

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
 * @param {HTMLElement} container - The DOM container element to mount into
 * @returns {() => void} A cleanup function that unmounts the component when called
 *
 * @example
 * Mounting a plain function component
 * ```typescript
 * import { mount, $ } from '@fimbul-works/seidr';
 *
 * const App = () => $('div', { textContent: 'Hello Seidr' });
 * const unmount = mount(App, document.body);
 * ```
 *
 * @example
 * Mounting a component instance
 * ```typescript
 * const comp = component(() => $('div'))();
 * mount(comp, document.body);
 * ```
 */
export function mount<C extends SeidrNode | SeidrComponent>(
  componentOrFactory: C | (() => C),
  container: HTMLElement,
): () => void {
  let component: SeidrComponent;

  if (typeof componentOrFactory === "function") {
    // If it's a factory, wrap/call it to get a component instance
    component = (
      isSeidrComponentFactory(componentOrFactory)
        ? (componentOrFactory as any)()
        : createComponent(componentOrFactory as any)()
    ) as SeidrComponent;
  } else if (isSeidrComponent(componentOrFactory)) {
    // It's already a component instance
    component = componentOrFactory;
  } else {
    // It's a raw element or other SeidrNode, wrap it
    component = createComponent(() => componentOrFactory as SeidrNode)() as SeidrComponent;
  }

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
