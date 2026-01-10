import { isHTMLElement } from "../../util/is";
import { getComponentStack, type SeidrComponent } from "../component";
import { type ComponentScope, createScope } from "../component-scope";

/**
 * Creates a component with error boundary protection.
 *
 * Safe wraps a component factory with error handling. If the component factory throws
 * an error during initialization, the error boundary factory is called to create
 * a fallback UI instead of crashing.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {SeidrElement<K>} T - The type of element the component returns
 *
 * @param {(scope: ComponentScope) => T} factory - Function that creates the component element
 * @param {(err: Error, scope: ComponentScope) => T} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {SeidrComponent<K, T>} A Component instance with error handling
 *
 * @example
 * Basic error boundary
 * ```typescript
 * import { Safe, $div, $h2, $p } from '@fimbul-works/seidr';
 *
 * const UserProfile = Safe(
 *   (scope) => {
 *     // Component initialization that might fail
 *     const data = fetchUserData();
 *     return $div({ textContent: data.name });
 *   },
 *   (err, scope) => {
 *     // Error boundary: return fallback UI
 *     return $div({ className: 'error' }, [
 *       $h2({ textContent: 'Error Occurred' }),
 *       $p({ textContent: err.message })
 *     ]);
 *   }
 * );
 * ```
 *
 * @example
 * With resource cleanup
 * ```typescript
 * import { Safe, $div, $button } from '@fimbul-works/seidr';
 *
 * const SafeComponent = Safe(
 *   (scope) => {
 *     // Track resources
 *     scope.track(() => console.log('Component cleanup'));
 *
 *     throw new Error('Failed');
 *     return $div();
 *   },
 *   (err, scope) => {
 *     // Error boundary gets its own scope for resource tracking
 *     scope.track(() => console.log('Error boundary cleanup'));
 *
 *     return $div({ textContent: 'Fallback UI' });
 *   }
 * );
 * ```
 */
export function Safe<K extends keyof HTMLElementTagNameMap, T extends Node>(
  factory: (scope: ComponentScope) => T,
  errorBoundaryFactory: (err: Error, scope: ComponentScope) => T,
): SeidrComponent<K, T> {
  const stack = getComponentStack();
  const isRootComponent = stack.length === 0;

  // Create the scope and partial SeidrComponent
  const scope = createScope();
  const comp = {
    isSeidrComponent: true,
    scope,
    destroy: () => scope.destroy(),
  } as SeidrComponent<K, T>;

  // Register as child component
  if (stack.length > 0) {
    stack[stack.length - 1].scope.child(comp);
  }

  // Add to component stack
  stack.push(comp);

  // Render the component via factory with error handling
  try {
    comp.element = factory(scope);
  } catch (err) {
    scope.destroy();
    comp.scope = createScope();
    comp.element = errorBoundaryFactory(err as Error, comp.scope);
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

  // Propagate onAttached from scope
  if (comp.scope.onAttached) {
    comp.onAttached = comp.scope.onAttached;
  }

  // Remove from stack
  stack.pop();

  // Apply root element attributes
  if (isRootComponent && isHTMLElement(comp.element)) {
    comp.element.dataset.seidrRoot = "true";
  }

  // Root component must clear out component stack
  if (isRootComponent && stack.length > 0) {
    while (stack.length) stack.pop();
  }

  return comp;
}
