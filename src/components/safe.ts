import { component } from "../component/component";
import { createScope } from "../component/component-scope";
import { getCurrentComponent } from "../component/component-stack";
import type { SeidrComponent, SeidrComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { tryCatchFinally } from "../util/try-catch-finally";
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
 * @param {SeidrComponentFactoryFunction} factory - Function that creates the component element
 * @param {SeidrComponentFactoryFunction<Error>} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {SeidrComponent} A Component instance with error handling
 */
export const Safe = <
  C extends SeidrComponentFactoryFunction = SeidrComponentFactoryFunction,
  E extends SeidrComponentFactoryFunction<Error> = SeidrComponentFactoryFunction<Error>,
>(
  factory: C,
  errorBoundaryFactory: E,
  name?: string,
): SeidrComponent =>
  component(() => {
    const scope = useScope();

    return tryCatchFinally(
      () => wrapComponent(factory)(),
      null,
      (err) => {
        const newScope = createScope();
        newScope.onAttached = (parent) => scope.onAttached?.(parent);

        const currentComp = getCurrentComponent();
        if (currentComp) {
          currentComp.scope = newScope;
        }

        return wrapComponent(errorBoundaryFactory)(wrapError(err));
      },
    );
  }, name ?? "Safe")();
