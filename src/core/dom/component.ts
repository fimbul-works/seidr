import { getRenderContext } from "../render-context-contract";
import { type ComponentScope, createScope } from "./component-scope";
import type { SeidrElement } from "./element";

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
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management. Each component tracks its own reactive bindings, event listeners,
 * and child components.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {SeidrElement<K>} E - The type of SeidrElement this component contains
 */
export interface SeidrComponent<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  E extends SeidrElement<K> = any,
> {
  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {E}
   */
  element: E;

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
 * Creates a component with automatic lifecycle and resource management.
 *
 * Components are the primary building blocks in Seidr applications. They encapsulate
 * both UI elements and the reactive logic needed to manage them. The component
 * function automatically tracks cleanup functions, reactive bindings, and child
 * components to prevent memory leaks.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {SeidrElement<K>} E - The type of SeidrElement the component returns
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
    scope,
    destroy: () => scope.destroy(),
  } as SeidrComponent<K, E>;

  // Register as child component
  if (stack.length > 0) {
    stack[stack.length - 1].scope.child(component);
  }

  // Add the object to the stack to the stack
  stack.push(component);

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
  if (isRootComponent && stack.length > 0) {
    while (stack.length) stack.pop();
  }

  return component;
}
