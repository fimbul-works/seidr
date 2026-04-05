import { getAppState } from "../app-state/app-state";
import { DATA_KEY_ACTIVE_SCOPE } from "../constants";
import type { Component } from "./types";

/**
 * Returns the root component of the current render context.
 * @returns {Component | null} The root component, or null if none found.
 * @internal
 */
export const getRootComponent = (): Component | null => {
  let current = getAppState().getData<Component>(DATA_KEY_ACTIVE_SCOPE) || null;
  while (current?.parent) {
    current = current.parent;
  }
  return current;
};
