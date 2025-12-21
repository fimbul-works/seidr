import type { SeidrElement } from "./element.js";
import type { CleanupFunction } from "./seidr.js";

/**
 * A component is a factory function that returns an element and its cleanup logic.
 */
export interface Component<E extends SeidrElement = SeidrElement> {
  element: E;
  destroy(): void;
}

/**
 * Manages cleanup functions for a component's lifecycle.
 * Automatically tracks bindings, child components, and event listeners.
 */
export interface ComponentScope {
  /**
   * Track a cleanup function to be called on destroy.
   * @param cleanup - Cleanup function
   */
  track(cleanup: CleanupFunction): void;

  /**
   * Track a child component to be destroyed when this component is destroyed.
   * @template E - The type of HTML element the child is
   *
   * @param component - Child component to track
   * @return The child Component
   */
  child<E extends SeidrElement>(component: Component<E>): Component<E>;

  /**
   * Destroy all tracked resources.
   */
  destroy(): void;
}

/**
 * Create a new ComponentScope instance to track Component cleanup logic.
 * @returns ComponentScope instance
 */
export function createScope(): ComponentScope {
  let cleanups: CleanupFunction[] = [];
  let destroyed = false;

  const track: ComponentScope["track"] = (cleanup: CleanupFunction): void => {
    if (destroyed) {
      console.warn("Tracking cleanup on already destroyed scope");
      cleanup();
      return;
    }
    cleanups.push(cleanup);
  };

  const child: ComponentScope["child"] = <E extends SeidrElement>(component: Component<E>): Component<E> => {
    track(() => component.destroy());
    return component;
  };

  const destroy: ComponentScope["destroy"] = () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cleanups.forEach((fn) => fn());
    cleanups = [];
  };

  return {
    track,
    child,
    destroy,
  };
}

/**
 * Creates a component with automatic cleanup management.
 *
 * @template E - The type of HTML element being bound to
 *
 * @param factory - Component factory function
 * @return Component with an element and a cleanup function
 *
 * @example
 * export function Counter() {
 *   return component((scope) => {
 *     const count = new Seidr(0);
 *     const button = ButtonEl({ textContent: 'Count: 0' });
 *
 *     scope.track(bind(count, button, (val, el) => {
 *       el.textContent = `Count: ${val}`;
 *     }));
 *
 *     button.on('click', () => count.set(count.get() + 1));
 *
 *     return button;
 *   });
 * }
 */
export function component<E extends SeidrElement>(factory: (scope: ComponentScope) => E): Component<E> {
  const scope = createScope();
  const element = factory(scope);
  return {
    element,
    destroy: () => (scope.destroy(), element.destroy()),
  };
}
