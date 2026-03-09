import { SeidrError } from "../types";
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
export const useScope = (): Readonly<ComponentScope> => {
  const current = getCurrentComponent();
  if (!current) {
    throw new SeidrError("useScope() must be called within a component");
  }
  const { id, isMounted, parent, parentNode, onMount, onUnmount } = current;
  return {
    get id() {
      return id;
    },
    get isMounted() {
      return isMounted;
    },
    get parent() {
      return parent;
    },
    get parentNode() {
      return parentNode;
    },
    onMount,
    onUnmount,
  };
};
