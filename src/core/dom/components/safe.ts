import { isSeidrComponentFactory } from "../../util/is";
import { component, createScope, getCurrentComponent, type SeidrComponent, useScope } from "../component";
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

    try {
      return (isSeidrComponentFactory(factory) ? factory() : component(factory)()) as T;
    } catch (err) {
      // Destroy scope from failed component
      scope.destroy();

      const newScope = createScope();

      // Ensure onAttached events propagate through the new scope to the original scope's handler
      // which will be set up by the component() wrapper after this function returns.
      newScope.onAttached = (parent) => {
        scope.onAttached?.(parent);
      };

      const currentComp = getCurrentComponent();
      if (currentComp) {
        currentComp.scope = newScope;
      }

      return isSeidrComponentFactory(errorBoundaryFactory)
        ? errorBoundaryFactory(err as Error)
        : component(errorBoundaryFactory)(err as Error);
    }
  })();
}
