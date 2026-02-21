import { component } from "../component/component";
import type { Component, ComponentFactoryFunction } from "../component/types";
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
 * @param {ComponentFactoryFunction} factory - Function that creates the component element
 * @param {ComponentFactoryFunction<Error>} errorBoundaryFactory - Error handler that returns fallback UI
 * @returns {Component} A Component instance with error handling
 */
export const Safe = <
  C extends ComponentFactoryFunction = ComponentFactoryFunction,
  E extends ComponentFactoryFunction<Error> = ComponentFactoryFunction<Error>,
>(
  factory: C,
  errorBoundaryFactory: E,
  name?: string,
): Component =>
  component(() => {
    const scope = useScope();

    try {
      return wrapComponent(factory)();
    } catch (err) {
      // Clean up any resources tracked during the failed factory call
      (scope as Component).reset?.();

      return wrapComponent(errorBoundaryFactory)(wrapError(err));
    }
  }, name ?? "Safe")();
