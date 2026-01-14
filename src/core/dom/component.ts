import { getRenderContext } from "../render-context-contract";
import { isHTMLElement, isSeidrComponent } from "../util/is";
import { type ComponentScope, createScope } from "./component-scope";
import type { SeidrNode } from "./element";

// Check if we're in SSR mode
const isSSR = typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);

export { createScope };

/** Map of SeidrComponent stack by render context ID */
const renderScopeComponentStacks = new Map<number, SeidrComponent[]>();

/**
 * Get the component stack for a render context.
 * @returns {SeidrComponent[]} SeidrComponent stack
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
 * Get the current component from the component stack
 * @returns {SeidrComponent | null} Current SeidrComponent, or null if stack is empty
 */
export const getCurrentComponent = (): SeidrComponent | null => {
  const stack = getComponentStack();
  if (stack.length > 0) {
    return stack[stack.length - 1];
  }
  return null;
};

/**
 * Gets the scope of the current component.
 *
 * This is a convenience helper that provides access to the current component's scope
 * for tracking cleanup functions and child components. It must be called within a component.
 *
 * @throws {Error} If called outside of a component context
 * @returns {ComponentScope} The scope of the current component
 *
 * @example
 * Using useScope in a component
 * ```typescript
 * // Works in both plain functions and component() wrapped factories!
 * const Counter = () => {
 *   const scope = useScope();
 *   const count = new Seidr(0);
 *
 *   return $button({
 *     textContent: count.as(v => `Count: ${v}`),
 *     onclick: () => count.value++
 *   });
 * };
 * ```
 */
export const useScope = (): ComponentScope => {
  const current = getCurrentComponent();
  if (!current) {
    throw new Error("useScope() must be called within a component");
  }
  return current.scope;
};

/**
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management. Each component tracks its own reactive bindings, event listeners,
 * and child components.
 *
 * @template {Node} T - The type of SeidrElement this component contains
 */
export interface SeidrComponent<T extends Node = any> {
  /**
   * Read-only identifier for Seidr components.
   * @type {true}
   */
  readonly isSeidrComponent: true;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {T}
   */
  element: T;

  /**
   * The ComponentScope of this element.
   * @type {ComponentScope}
   */
  scope: ComponentScope;

  /**
   * Destroys the component and all its resources.
   *
   * This method performs comprehensive cleanup:
   * - Destroys the root element and all children
   * - Removes all event listeners
   * - Cleans up all reactive bindings
   * - Executes all tracked cleanup functions
   * @type {() => void}
   */
  destroy(): void;
}

/**
 * Seidr component factories has a boolean flag to identify it has been wrapped with `component()`.
 */
interface SeidrComponentFactoryInterface {
  isComponentFactory: true;
}

/**
 * Seidr component factory type.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactory<P> = (P extends void ? () => SeidrComponent : (props: P) => SeidrComponent) &
  SeidrComponentFactoryInterface;

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * Components are the primary building blocks in Seidr applications. They encapsulate
 * both UI elements and the reactive logic needed to manage them. The component
 * function automatically tracks cleanup functions, reactive bindings, and child
 * components to prevent memory leaks.
 *
 * @template P - Props object type (optional)
 *
 * @param {(props: P) => SeidrNode} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 *
 * @example
 * Using component() for explicit factory creation
 * ```typescript
 * import { component, useScope, Seidr, $button } from '@fimbul-works/seidr';
 *
 * // Create a reusable factory
 * const Counter = component(({ initialValue = 0 }) => {
 *   const count = new Seidr(initialValue);
 *   return $button({
 *     textContent: count.as(v => `Count: ${v}`),
 *     onclick: () => count.value++
 *   });
 * });
 *
 * // Usage creates a SeidrComponent instance
 * const comp = Counter({ initialValue: 5 });
 * ```
 *
 * @example
 * Component without props
 * ```typescript
 * const App = component(() => {
 *   const scope = useScope();
 *   const user = new Seidr({ name: 'John' });
 *
 *   return $('div', { className: 'profile' }, [
 *     $('span', { textContent: user.as(u => u.name) })
 *   ]);
 * });
 *
 * // Usage
 * App();
 * ```
 *
 * @example
 * Components as plain functions passed to children
 * ```typescript
 * const Header = () => $('header', { textContent: 'User Profile' });
 * const Avatar = () => $('img', { src: '/avatar.png' });
 *
 * const UserProfile = () => {
 *   return $('div', { className: 'profile' }, [
 *     Header, // Plain functions are automatically wrapped
 *     Avatar,
 *     $('span', { textContent: 'John Doe' })
 *   ]);
 * };
 * ```
 */
export function component<P = void>(
  factory: P extends void ? () => SeidrNode : (props: P) => SeidrNode,
): SeidrComponentFactory<P> {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props?: P) => {
    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;

    // Create the scope and partial SeidrComponent
    const scope = createScope();
    const comp = {
      isSeidrComponent: true,
      scope,
      destroy: () => scope.destroy(),
    } as SeidrComponent;

    // Register as child component
    if (stack.length > 0) {
      stack[stack.length - 1].scope.child(comp);
    }

    // Add to component stack
    stack.push(comp);

    // Render the component via factory
    try {
      // Call factory with props (or undefined if no props)
      const result = factory(props as P);

      // Track child SeidrComponents to propagate onAttached
      const childComponents: SeidrComponent[] = [];

      // Support for array returns (multiple root nodes)
      if (Array.isArray(result)) {
        if (isSSR) {
          // In SSR, we can't use DocumentFragment because ServerComment instances
          // can't be appended to real DOM fragments. Instead, create a wrapper div.
          const wrapper = document.createElement("div");
          result.forEach((item) => {
            // Unwrap SeidrComponents to their elements
            const node = isSeidrComponent(item) ? item.element : item;
            // Track child components for onAttached propagation
            if (isSeidrComponent(item)) {
              childComponents.push(item);
            }
            // ServerHTMLElement.appendChild knows how to handle ServerComment
            (wrapper as any).appendChild(node);
          });
          comp.element = wrapper;
        } else {
          // Client-side: Use DocumentFragment as normal
          const fragment = document.createDocumentFragment();
          result.forEach((item) => {
            // Unwrap SeidrComponents to their elements
            const node = isSeidrComponent(item) ? item.element : item;
            // Track child components for onAttached propagation
            if (isSeidrComponent(item)) {
              childComponents.push(item);
            }
            fragment.appendChild(node as Node);
          });
          comp.element = fragment as any;
        }
      } else {
        // Unwrap SeidrComponents to their elements
        comp.element = isSeidrComponent(result) ? result.element : result;
        // Track child component for onAttached propagation
        if (isSeidrComponent(result)) {
          childComponents.push(result);
        }
      }

      // Set up destroy method
      comp.destroy = () => {
        comp.scope.destroy();
        const el = comp.element as any;
        if (el?.remove) {
          el.remove();
        } else if (el?.parentNode) {
          try {
            el.parentNode.removeChild(el);
          } catch (_e) {
            // Ignore if node was already removed or parent changed
          }
        }
      };

      // Propagate onAttached from scope to child components
      if (childComponents.length > 0) {
        // Always wrap scope.onAttached (or create one) to call child components' onAttached
        const originalOnAttached = scope.onAttached;
        scope.onAttached = (parent: Node) => {
          // Call onAttached for all child components first
          for (const child of childComponents) {
            if (child.scope.onAttached) {
              child.scope.onAttached(parent);
            }
          }
          // Then call this component's scope.onAttached (if it exists)
          if (originalOnAttached) {
            originalOnAttached(parent);
          }
        };
      }
    } finally {
      // Remove from stack
      stack.pop();
    }

    // Apply root element attributes
    if (isRootComponent && isHTMLElement(comp.element)) {
      comp.element.dataset.seidrRoot = String(getRenderContext()?.renderContextID ?? true);
    }

    // Root component must clear out component stack
    if (isRootComponent && stack.length > 0) {
      while (stack.length) stack.pop();
    }

    return comp;
  }) as SeidrComponentFactory<P>;

  // Add component factory flag
  componentFactory.isComponentFactory = true;
  return componentFactory;
}
