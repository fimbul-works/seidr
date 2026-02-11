import type { SeidrComponent, SeidrComponentFactoryFunction } from "../../component/types";
import { wrapComponent } from "../../component/wrap-component";

/**
 * Gets the component for a given value from a map or object of factories.
 * @template T - The type of the value.
 * @template C - The type of the component factory.
 * @template M - The type of the factories map or object.
 * @param {M} factories Map or object of factories.
 * @param {T} value The value to get the component for.
 * @param {C} [fallbackFactory] Optional fallback factory.
 * @returns {SeidrComponent | undefined} The component for the given value.
 */
export const getComponent = <
  T,
  C extends SeidrComponentFactoryFunction<T> = SeidrComponentFactoryFunction<T>,
  M extends Map<T, C> | Record<T & string, C> = Map<T, C> | Record<T & string, C>,
>(
  factories: M,
  value: T,
  fallbackFactory?: C | null,
): SeidrComponent | undefined => {
  const factory = (factories instanceof Map ? factories.get(value) : factories[value as keyof M]) ?? fallbackFactory;
  return factory ? wrapComponent<T>(factory as SeidrComponentFactoryFunction<T>)(value) : undefined;
};
