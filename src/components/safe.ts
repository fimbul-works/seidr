import { component } from "../component/component";
import { getCurrentComponent } from "../component/component-stack";
import type { Component, ComponentFactoryFunction } from "../component/types";
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
    const instance = getCurrentComponent();

    try {
      // We wrap the factory call to ensure that if it throws,
      // we can still attempt to cleanup any partial registration
      const childFactory = wrapComponent(factory);
      return childFactory();
    } catch (err) {
      // Clean up any resources tracked during the failed factory call
      instance?.unmount();

      return wrapComponent(errorBoundaryFactory)(wrapError(err));
    }
  }, name ?? "Safe")();
