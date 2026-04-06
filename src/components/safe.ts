import { component } from "../component/component.js";
import type { Component, ComponentFactoryFunction } from "../component/types.js";
import { useScope } from "../component/use-scope.js";
import { wrapComponent } from "../component/wrap-component.js";
import { wrapError } from "../util/wrap-error.js";

/**
 * Creates a component with error boundary protection.
 *
 * Safe wraps a component factory with error handling. If the component factory throws
 * an error during initialization, the error boundary factory is called to create
 * a fallback UI instead of crashing.
 *
 * @template T -
 *
 * @param {ComponentFactoryFunction} factory - Function that creates the component element
 * @param {ComponentFactoryFunction<Error>} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {Component} A Component instance with error handling
 */
export const Safe = (
  factory: ComponentFactoryFunction,
  errorBoundaryFactory: ComponentFactoryFunction<Error>,
  name?: string,
): Component =>
  component(() => {
    const safeComponent = useScope();

    try {
      // We wrap the factory call to ensure that if it throws,
      // we can still attempt to cleanup any partial registration
      return wrapComponent(factory)(undefined, safeComponent);
    } catch (err) {
      // Clean up any resources tracked during the failed factory call
      safeComponent?.cleanup();
      return wrapComponent(errorBoundaryFactory)(wrapError(err), safeComponent);
    }
  }, name || "Safe")();
