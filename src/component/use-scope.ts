import { SeidrError } from "../types";
import { getCurrentComponent } from "./component-stack";
import type { LifecycleScope } from "./types";

/**
 * Gets the scope of the current component.
 *
 * This is a convenience helper that provides access to the current component's scope
 * for tracking cleanup functions and child components. It must be called within a component.
 *
 * @throws {Error} If called outside of a component context
 * @returns {LifecycleScope} The scope of the current component
 */
export const useScope = (): LifecycleScope => {
  const current = getCurrentComponent();
  if (!current) {
    throw new SeidrError("useScope() must be called within a component");
  }
  return current;
};
