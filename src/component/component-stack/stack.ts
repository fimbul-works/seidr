import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_STACK } from "../../constants";
import type { Component } from "../types";

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 * @internal
 */
export const pushComponent = (component: Component): void => getAppState().setData(DATA_KEY_COMPONENT_STACK, component);

/**
 * Pops the current component cursor, moving up to the parent.
 * @internal
 */
export const popComponent = (): void => {
  const current = getAppState().getData<Component>(DATA_KEY_COMPONENT_STACK);
  if (current) {
    getAppState().setData(DATA_KEY_COMPONENT_STACK, current.parent);
  }
};
