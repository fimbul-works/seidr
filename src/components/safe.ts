import { createComponent } from "../component/create-component.js";
import type { SeidrComponent } from "../component/types.js";
import type { SeidrChild } from "../element/types.js";
import { wrapError } from "../index.core.js";

/**
 * Creates a component with error boundary protection.
 *
 * Safe wraps a component factory with error handling. If the component factory throws
 * an error during initialization, the error boundary factory is called to create
 * a fallback UI instead of crashing.
 *
 * @param {() => SeidrChild} factory - Function that creates the component or element
 * @param {(error: Error) => SeidrChild} errorBoundary - Error handler that returns fallback UI
 * @param {string} [name="Safe"] - Optional name for the component
 * @returns {SeidrComponent} A Component instance with error handling
 */
export const Safe = (
  factory: () => SeidrChild,
  errorBoundary: (error: Error) => SeidrChild,
  name: string = "Safe",
): SeidrComponent =>
  createComponent(() => {
    try {
      return factory();
    } catch (err) {
      if (process.env.NODE_ENV === "development" || process.env.VITEST) {
        console.error(`Error in component ${name}`, err);
      }
      return errorBoundary(wrapError(err));
    }
  }, name)();
