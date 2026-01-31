import { getCurrentComponent } from "./component-stack";
import type { ComponentScope } from "./types";

/**
 * Gets the scope of the current component.
 *
 * This is a convenience helper that provides access to the current component's scope
 * for tracking cleanup functions and child components. It must be called within a component.
 *
 * @throws {Error} If called outside of a component context
 * @returns {ComponentScope} The scope of the current component
 */
export const useScope = (): ComponentScope => {
  const current = getCurrentComponent();
  if (!current) {
    throw new Error("useScope() must be called within a component");
  }
  return current.scope;
};
