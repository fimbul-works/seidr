import { isSeidrComponentFactory } from "../../util/is";
import { component, createScope, getComponentStack, type SeidrComponent, useScope } from "../component";
import type { SeidrNode } from "../element";

/**
 * Creates a component with error boundary protection.
 *
 * Safe wraps a component factory with error handling. If the component factory throws
 * an error during initialization, the error boundary factory is called to create
 * a fallback UI instead of crashing.
 *
 * @template {SeidrNode} T - The type of element the component returns
 *
 * @param {() => T} factory - Function that creates the component element
 * @param {(err: Error) => T} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {SeidrComponent} A Component instance with error handling
 */
export function Safe<T extends SeidrNode>(factory: () => T, errorBoundaryFactory: (err: Error) => T): SeidrComponent {
  return component(() => {
    const scope = useScope();
    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;
    const currentComp = stack[stack.length - 1];

    try {
      try {
        return (isSeidrComponentFactory(factory) ? factory() : component(factory)()) as T;
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
