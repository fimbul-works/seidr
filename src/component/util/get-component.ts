import type { Component, ComponentFactoryFunction } from "../types";
import { wrapComponent } from "../wrap-component";

/**
 * Gets the component for a given value from a map or object of factories.
 * @template T - The type of the value.
 * @template C - The type of the component factory.
 * @template M - The type of the factories map or object.
 * @param {M} factories Map or object of factories.
 * @param {T} value The value to get the component for.
 * @param {C | null} [fallbackFactory] Optional fallback factory.
 * @returns {Component | undefined} The component for the given value.
 */
export const getComponent = <
  T extends string,
  C extends ComponentFactoryFunction<T> = ComponentFactoryFunction<T>,
  M extends Map<T, C> | Record<T, C> = Map<T, C> | Record<T, C>,
>(
  factories: M,
  value: T,
  fallbackFactory?: C | null,
): Component | undefined => {
  const factory = (factories instanceof Map ? factories.get(value) : factories[value as keyof M]) ?? fallbackFactory;
  return factory ? wrapComponent<T>(factory as ComponentFactoryFunction<T>)(value) : undefined;
};
