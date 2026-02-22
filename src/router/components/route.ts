import type { Component, ComponentFactoryFunction } from "../../component/types";
import { Conditional } from "../../components/conditional";
import type { Seidr } from "../../seidr/seidr";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { parseRouteParams } from "../parse-route-params";

/**
 * Conditionally mount a Component when current URL path matches pattern
 *
 * @template {Record<string, string>} T - The type of matching route parameters
 * @template {ComponentFactoryFunction} C - The type of component factory
 *
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {C} factory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {Component} Conditional component that mounts when matched
 */
export const Route = <
  T extends Record<string, string> = Record<string, string>,
  C extends ComponentFactoryFunction = ComponentFactoryFunction,
>(
  pattern: string | RegExp,
  factory: C,
  pathState: Seidr<string> = getCurrentPath(),
): Component => {
  let routeParams: Seidr<T | false>;

  if (pattern instanceof RegExp) {
    // Match pathState.value against RegExp pattern
    routeParams = pathState.as<T | false>((path: string) => {
      const match = path.match(pattern);
      return match ? ((match.groups ?? {}) as T) : false;
    });
  } else {
    // Attempt to match path with pattern
    routeParams = pathState.as<T | false>((path: string) => parseRouteParams(pattern, path));
  }

  routeParams.bind(getCurrentParams(), (params, observable) => (observable.value = params as T));

  const isMatch = routeParams.as<boolean>((params: T | false) => !!params);
  return Conditional(isMatch, factory, null, "Route");
};
