import { getAppState } from "../../app-state/app-state";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "../../constants";

/**
 * Returns the root component of the current render context.
 * @returns {Component | null} The root component, or null if none found.
 * @internal
 */
export const getRootComponent = (): Component | null => {
  let current = getAppState().getData<Component>(COMPONENT_STACK_DATA_KEY) || null;
  while (current?.parent) {
    current = current.parent;
  }
  return current;
};
