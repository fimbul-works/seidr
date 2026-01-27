import { component, type SeidrComponent } from "../../../dom/component/component";
import { createScope } from "../../../dom/component/component-scope";
import { getCurrentComponent } from "../../../dom/component/component-stack";
import { wrapComponent } from "../../../dom/component/wrap-component";
import type { SeidrNode } from "../../../dom/element/element";
import { useScope } from "../use-scope";

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
      return wrapComponent(factory)() as T;
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

      return wrapComponent(errorBoundaryFactory)(err as Error);
    }
  })();
}
