import { getRenderContext } from "../render-context-contract";
import type { CleanupFunction } from "../types";
import type { SeidrElement } from "./element";

/** Map of SeidrComponent stack by render context ID */
const renderScopeComponentStacks = new Map<number, SeidrComponent[]>();

/**
 * Get the component stack for a render context.
 * @returns SeidrComponent stack
 */
export const getComponentStack = (): SeidrComponent[] => {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.renderContextID : 0;

  // Initialize component stack if needed
  if (!renderScopeComponentStacks.has(renderScopeID)) {
    renderScopeComponentStacks.set(renderScopeID, []);
  }
  return renderScopeComponentStacks.get(renderScopeID) as SeidrComponent[];
};

/**
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management. Each component tracks its own reactive bindings, event listeners,
 * and child components.
 *
 * @template E - The type of SeidrElement this component contains
 *
 * @example
 * Component usage
 * ```typescript
 * import { component, mount } from '@fimbul-works/seidr';
 *
 * const counterComponent = createCounter();
 * document.body.appendChild(counterComponent.element);
 *
 * // Later cleanup
 * counterComponent.destroy();
 * ```
 */
export interface SeidrComponent<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  E extends SeidrElement<K> = any,
> {
  /**
   * Whether this SeidrComponent is rendered at root
   */
  readonly isRootComponent: boolean;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   */
  element: E;

  /**
   * Destroys the component and all its resources.
   *
   * This method performs comprehensive cleanup:
   * - Destroys the root element and all children
   * - Removes all event listeners
   * - Cleans up all reactive bindings
   * - Executes all tracked cleanup functions
   */
  destroy(): void;
}

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
   * @param cleanup - The cleanup function to execute
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
  track(cleanup: CleanupFunction): void;

  /**
   * Tracks a child component for automatic cleanup when this component is destroyed.
   *
   * Child components are automatically destroyed when their parent component
   * is destroyed, creating a proper cleanup hierarchy. This method ensures
   * that child components are properly managed and cleaned up.
   *
   * @template E - The type of SeidrElement the child component contains
   *
   * @param component - The child component to track
   *
   * @returns The same child component (for chaining or convenience)
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
  child<K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
    component: SeidrComponent<K, E>,
  ): SeidrComponent<K, E>;

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
}

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * ComponentScope instances are typically created internally by the component()
 * function, but can also be created directly for advanced use cases or testing.
 *
 * @returns A new ComponentScope instance with cleanup tracking capabilities
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

  const child: ComponentScope["child"] = <K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
    component: SeidrComponent<K, E>,
  ): SeidrComponent<K, E> => {
    track(() => component.destroy());
    return component;
  };

  const destroy: ComponentScope["destroy"] = () => {
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
  };

  return {
    track,
    child,
    destroy,
  };
}

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * Components are the primary building blocks in Seidr applications. They encapsulate
 * both UI elements and the reactive logic needed to manage them. The component
 * function automatically tracks cleanup functions, reactive bindings, and child
 * components to prevent memory leaks.
 *
 * @template E - The type of SeidrElement the component returns
 *
 * @param {(scope: ComponentScope) => E} factory - Function that creates the component element and tracks resources
 * @returns {SeidrComponent<K, E>} A Component instance with the created element and destroy method
 *
 * @example
 * Basic counter component
 * ```typescript
 * import { component, Seidr, $ } from '@fimbul-works/seidr';
 *
 * function Counter() {
 *   return component((scope) => {
 *     const count = new Seidr(0);
 *     const button = $('button', { textContent: 'Count: 0' });
 *
 *     // Track reactive binding
 *     scope.track(count.bind(button, (value, el) => {
 *       el.textContent = `Count: ${value}`;
 *     }));
 *
 *     // Track event listener
 *     scope.track(button.on('click', () => count.value++));
 *
 *     return button;
 *   });
 * }
 * ```
 *
 * @example
 * Component with child components
 * ```typescript
 * function UserProfile() {
 *   return component((scope) => {
 *     const user = new Seidr({ name: 'John', email: 'john@example.com' });
 *
 *     const header = scope.child(createHeader());
 *     const avatar = scope.child(createAvatar());
 *
 *     const container = $('div', { className: 'profile' }, [
 *       header.element,
 *       avatar.element,
 *       $('span', { textContent: user.as(u => u.name) })
 *     ]);
 *
 *     return container;
 *   });
 * }
 * ```
 */
export function component<K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
  factory: (scope: ComponentScope) => E,
): SeidrComponent<K, E> {
  const stack = getComponentStack();
  const isRootComponent = stack.length === 0;

  // Create the scope and partial SeidrComponent
  const scope = createScope();
  const component = {
    isRootComponent,
    destroy: () => scope.destroy(),
  } as SeidrComponent;

  // Add the object to the stack to the stack
  stack.push(component as SeidrComponent);

  // Render the component via factory
  try {
    component.element = factory(scope);
    component.destroy = () => (scope.destroy(), component.element.remove());
  } catch (err) {
    console.error(`Component error`, err);
    scope.destroy();
  } finally {
    stack.pop();
  }

  // Root component must clear out component stack
  if (component.isRootComponent && stack.length > 0) {
    while (stack.length) stack.pop();
  }

  return component as SeidrComponent;
}
