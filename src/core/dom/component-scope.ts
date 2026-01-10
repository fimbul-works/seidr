import type { SeidrComponent } from "./component";

/**
 * Manages cleanup functions and child components within a component's lifecycle.
 *
 * The ComponentScope provides a centralized way to track all resources that
 * need to be cleaned up when a component is destroyed. This prevents memory
 * leaks and ensures proper resource management throughout the application.
 */
export interface ComponentScope {
  /**
   * Tracks a cleanup function to be executed when the component is destroyed.
   *
   * Use this method to register any cleanup logic that should run when
   * the component is no longer needed, such as removing event listeners,
   * cleaning up reactive bindings, or clearing timeouts.
   *
   * @param {() => void} cleanup - The cleanup function to execute
   *
   * @example
   * Tracking various cleanup functions
   * ```typescript
   * const timeoutId = setTimeout(() => {}, 1000);
   * const cleanup = () => clearTimeout(timeoutId);
   *
   * scope.track(cleanup);
   * scope.track(() => console.log('Component destroyed'));
   * ```
   */
  track(cleanup: () => void): void;

  /**
   * Tracks a child component for automatic cleanup when this component is destroyed.
   *
   * Child components are automatically destroyed when their parent component
   * is destroyed, creating a proper cleanup hierarchy. This method ensures
   * that child components are properly managed and cleaned up.
   *
   * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
   * @template {SeidrElement<K>} E - The type of SeidrElement the child component contains
   *
   * @param {SeidrComponent<K, E>} component - The child component to track
   * @returns {SeidrComponent<K, E>} The same child SeidrComponent
   *
   * @example
   * Managing child components
   * ```typescript
   * const headerComponent = createHeader();
   * const footerComponent = createFooter();
   *
   // Track children for automatic cleanup
   * scope.child(headerComponent);
   * scope.child(footerComponent);
   * ```
   */
  child<K extends keyof HTMLElementTagNameMap, E extends Node>(component: SeidrComponent<K, E>): SeidrComponent<K, E>;

  /**
   * Destroys all tracked resources and marks the scope as destroyed.
   *
   * This method executes all registered cleanup functions in the order
   * they were added. Once destroyed, the scope can no longer be used
   * to track new cleanup functions.
   *
   * @example
   * Manual scope destruction
   * ```typescript
   * const scope = createScope();
   *
   * // Track some resources
   * scope.track(() => console.log('Cleanup 1'));
   * scope.track(() => console.log('Cleanup 2'));
   *
   * // Destroy everything
   * scope.destroy(); // Logs "Cleanup 1", then "Cleanup 2"
   * ```
   */
  destroy(): void;

  /**
   * Optional callback triggered when the component is attached to a parent.
   * @internal
   */
  onAttached?: (parent: Node) => void;
}

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * ComponentScope instances are typically created internally by the component()
 * function, but can also be created directly for advanced use cases or testing.
 *
 * @returns {ComponentScope} A new ComponentScope instance with cleanup tracking capabilities
 *
 * @example
 * Manual scope creation
 * ```typescript
 * const scope = createScope();
 *
 * scope.track(() => console.log('Cleaned up'));
 * scope.destroy(); // Executes cleanup
 * ```
 */
export function createScope(): ComponentScope {
  let cleanups: (() => void)[] = [];
  let destroyed = false;

  function track(cleanup: () => void): void {
    if (destroyed) {
      console.warn("Tracking cleanup on already destroyed scope");
      cleanup();
      return;
    }
    cleanups.push(cleanup);
  }

  function child<K extends keyof HTMLElementTagNameMap, E extends Node>(
    component: SeidrComponent<K, E>,
  ): SeidrComponent<K, E> {
    track(() => component.destroy());
    return component;
  }

  function destroy() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error(error);
      }
    });
    cleanups = [];
  }

  return {
    track,
    child,
    destroy,
    onAttached: undefined,
  };
}
