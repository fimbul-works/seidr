import { getAppState } from "../app-state/app-state";
import type { Component } from "./types";

export const COMPONENT_CURSOR_KEY = "seidr.component.cursor";

/**
 * Get the current component from the component tree.
 * @returns {Component | null} Current Component cursor, or null.
 */
export const getCurrentComponent = (): Component | null =>
  getAppState().getData<Component>(COMPONENT_CURSOR_KEY) ?? null;

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 */
export const push = (component: Component): void => getAppState().setData(COMPONENT_CURSOR_KEY, component);

/**
 * Pops the current component cursor, moving up to the parent.
 */
export const pop = (): void => {
  const current = getAppState().getData<Component>(COMPONENT_CURSOR_KEY);
  if (current) {
    getAppState().setData(COMPONENT_CURSOR_KEY, current.parent);
  }
};

/**
 * Returns the root component of the current render context.
 * @returns {Component | null} The root component, or null if none found.
 */
export const getRootComponent = (): Component | null => {
  let current = getAppState().getData<Component>(COMPONENT_CURSOR_KEY);
  if (!current) {
    return null;
  }
  while (current.parent) {
    current = current.parent;
  }
  return current;
};

/**
 * Executes a function within the context of a specific component.
 * Restores the previous context afterwards.
 *
 * @param {Component} component - The component context to switch to.
 * @param {() => T} fn - The function to execute.
 * @returns {T} The result of the function.
 */
export const executeInContext = <T>(component: Component, fn: () => T): T => {
  const state = getAppState();
  const previous = state.getData<Component>(COMPONENT_CURSOR_KEY) ?? null;
  try {
    state.setData(COMPONENT_CURSOR_KEY, component);
    return fn();
  } catch (error) {
    console.warn(error);
    return null as T;
  } finally {
    state.setData(COMPONENT_CURSOR_KEY, previous);
  }
};
