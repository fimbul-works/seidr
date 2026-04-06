import type { Component, ComponentFactoryFunction } from "../component/types.js";
import type { Seidr } from "../seidr/seidr.js";
import { Switch } from "./switch.js";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * @template {ComponentFactoryFunction} C - The type of component factory
 *
 * @param {Seidr} condition - Boolean observable that controls visibility
 * @param {C} factory - Function that creates the component or element when needed
 * @param {C} [fallbackFactory] - Optional fallback component factory
 * @param {string} name - Optional name for the component
 * @returns {Component} The component
 */
export const Show = <C extends ComponentFactoryFunction = ComponentFactoryFunction>(
  condition: Seidr,
  factory: C,
  fallbackFactory?: C | null,
  name?: string,
): Component =>
  Switch(
    condition.as<string>((v) => v && "true"),
    { true: factory as ComponentFactoryFunction<string> },
    fallbackFactory as ComponentFactoryFunction<string>,
    name || "Show",
  );
