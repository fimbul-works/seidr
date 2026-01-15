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
   */
  track(cleanup: () => void): void;

  /**
   * Tracks a child component for automatic cleanup when this component is destroyed.
   *
   * Child components are automatically destroyed when their parent component
   * is destroyed, creating a proper cleanup hierarchy. This method ensures
   * that child components are properly managed and cleaned up.
   *
   * @param {SeidrComponent} component - The child component to track
   * @returns {SeidrComponent} The same child SeidrComponent
   */
  child(component: SeidrComponent): SeidrComponent;

  /**
   * Destroys all tracked resources and marks the scope as destroyed.
   *
   * This method executes all registered cleanup functions in the order
   * they were added. Once destroyed, the scope can no longer be used
   * to track new cleanup functions.
   */
  destroy(): void;

  /**
   * Optional callback triggered when the component is attached to a parent.
   * @internal
   */
  onAttached?: (parent: Node) => void;

  /**
   * Whether the scope has been destroyed.
   */
  readonly isDestroyed: boolean;
}

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * ComponentScope instances are typically created internally by the component()
 * function, but can also be created directly for advanced use cases or testing.
 *
 * @returns {ComponentScope} A new ComponentScope instance with cleanup tracking capabilities
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

  function child(component: SeidrComponent): SeidrComponent {
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
    get isDestroyed() {
      return destroyed;
    },
    onAttached: undefined,
  };
}
