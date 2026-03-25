import type { Component, ComponentFactoryFunction } from "../types";
import { wrapComponent } from "../wrap-component";

/**
 * Gets the component for a given value from a map or object of factories.
 * @template {string} T - The type of the value.
 * @template {ComponentFactoryFunction<T> | ComponentFactoryFunction} C - The type of the component factory.
 * @template {Map<T, C | void> | Record<T, C | void>} M - The type of the factories map or object.
 * @param {M} factories - Map or object containing components.
 * @param {T} value - Branch key to match.
 * @param {C | null} [fallbackFactory] - Fallback component factory.
 * @param {string} [name="Component"] - Name for the wrapped component.
 * @returns {Component | undefined} Evaluated component if matched or fallback is provided, else undefined.
 */
export const getComponent = <
  T extends string,
  C extends ComponentFactoryFunction<T> | ComponentFactoryFunction =
    | ComponentFactoryFunction<T>
    | ComponentFactoryFunction,
  M extends Map<T, C | void> | Record<T, C | void> = Map<T, C | void> | Record<T, C | void>,
>(
  factories: M,
  value: T,
  fallbackFactory?: C | null,
  name?: string,
): Component | undefined => {
  if (!factories) {
    if (fallbackFactory) return wrapComponent<T>(fallbackFactory as ComponentFactoryFunction<T>, name)(value);
    return undefined;
  }

  const factory = (factories instanceof Map ? factories.get(value) : factories[value as keyof M]) || fallbackFactory;
  return factory ? wrapComponent<T>(factory as ComponentFactoryFunction<T>, name)(value) : undefined;
};
