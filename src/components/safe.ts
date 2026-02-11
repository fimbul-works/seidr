import { component } from "../component/component";
import { createScope } from "../component/component-scope";
import { getCurrentComponent } from "../component/component-stack";
import type { SeidrComponent, SeidrComponentFactory, SeidrComponentFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { wrapError } from "../util/wrap-error";

/**
 * Creates a component with error boundary protection.
 *
 * Safe wraps a component factory with error handling. If the component factory throws
 * an error during initialization, the error boundary factory is called to create
 * a fallback UI instead of crashing.
 *
 * @template T -
 *
 * @param {SeidrComponentFunction | SeidrComponentFactory} factory - Function that creates the component element
 * @param {SeidrComponentFunction<Error> | SeidrComponentFactory<Error>} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {SeidrComponent} A Component instance with error handling
 */
export const Safe = (
  factory: SeidrComponentFunction | SeidrComponentFactory,
  errorBoundaryFactory: SeidrComponentFunction<Error> | SeidrComponentFactory<Error>,
): SeidrComponent =>
  component(() => {
    const scope = useScope();

    try {
      return wrapComponent(factory)();
    } catch (err) {
      const newScope = createScope();
      newScope.onAttached = (parent) => scope.onAttached?.(parent);

      const currentComp = getCurrentComponent();
      if (currentComp) {
        currentComp.scope = newScope;
      }

      return wrapComponent(errorBoundaryFactory)(wrapError(err));
    }
  }, "Safe")();
