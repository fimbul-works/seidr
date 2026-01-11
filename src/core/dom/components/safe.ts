import { isHTMLElement } from "../../util/is";
import { component, createScope, getComponentStack, useScope, type SeidrComponent } from "../component";

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
 * @param {() => T} factory - Function that creates the component element
 * @param {(err: Error) => T} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {SeidrComponent<K, T>} A Component instance with error handling
 *
 * @example
 * Basic error boundary
 * ```typescript
 * import { Safe, $div, $h2, $p } from '@fimbul-works/seidr';
 *
 * const UserProfile = Safe(
 *   () => {
 *     // Component initialization that might fail
 *     const data = fetchUserData();
 *     return $div({ textContent: data.name });
 *   },
 *   (err) => {
 *     // Error boundary: return fallback UI
 *     return $div({ className: 'error' }, [
 *       $h2({ textContent: 'Error Occurred' }),
 *       $p({ textContent: err.message })
 *     ]);
 *   }
 * );
 * UserProfile();
 * ```
 *
 * @example
 * With resource cleanup
 * ```typescript
 * import { Safe, $div, $button } from '@fimbul-works/seidr';
 *
 * const SafeComponent = Safe(
 *   () => {
 *     const scope = useScope();
 *     // Track resources
 *     scope.track(() => console.log('Component cleanup'));
 *
 *     throw new Error('Failed');
 *     return $div();
 *   },
 *   (err) => {
 *     const scope = useScope();
 *     // Error boundary gets its own scope for resource tracking
 *     scope.track(() => console.log('Error boundary cleanup'));
 *
 *     return $div({ textContent: 'Fallback UI' });
 *   }
 * );
 * SafeComponent();
 * ```
 */
export function Safe<K extends keyof HTMLElementTagNameMap, T extends Node>(
  factory: () => T,
  errorBoundaryFactory: (err: Error) => T,
): SeidrComponent<K, T> {
  return component(() => {
    const scope = useScope();
    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;
    const currentComp = stack[stack.length - 1];

    try {
      try {
        return factory();
      } catch (err) {
        // Destroy scope from failed component and create new one for error boundary
        scope.destroy();
        const newScope = createScope();

        // Update the component's scope so useScope() returns the new scope
        if (currentComp) {
          currentComp.scope = newScope;
        }

        return errorBoundaryFactory(err as Error);
      }
    } finally {
      // Root component must clear out component stack
      if (isRootComponent && stack.length > 0) {
        while (stack.length) stack.pop();
      }
    }
  })();
}
