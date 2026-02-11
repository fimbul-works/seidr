import type { SeidrComponent, SeidrComponentFactoryFunction } from "../component/types";
import type { Seidr } from "../seidr";
import { Switch } from "./switch";

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * @template {SeidrComponentFactoryFunction} C - The type of component factory
 *
 * @param {Seidr<boolean>} condition - Boolean observable that controls visibility
 * @param {C} factory - Function that creates the component or element when needed
 * @param {C} [fallbackFactory] - Optional fallback component factory
 * @param {string} name - Optional name for the component
 * @returns {SeidrComponent} The component
 */
export const Conditional = <C extends SeidrComponentFactoryFunction = SeidrComponentFactoryFunction>(
  condition: Seidr<boolean>,
  factory: C,
  fallbackFactory?: C | null,
  name?: string,
): SeidrComponent =>
  Switch(
    condition.as((v) => !!v), // Force boolean
    new Map([[true, factory]]),
    fallbackFactory,
    name ?? "Conditional",
  );
