import { getAppState } from "../../app-state/app-state";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "./constants";

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 */
export const push = (component: Component): void => getAppState().setData(COMPONENT_STACK_DATA_KEY, component);

/**
 * Pops the current component cursor, moving up to the parent.
 */
export const pop = (): void => {
  const current = getAppState().getData<Component>(COMPONENT_STACK_DATA_KEY);
  if (current) {
    getAppState().setData(COMPONENT_STACK_DATA_KEY, current.parent);
  }
};
