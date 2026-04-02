import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_STACK } from "../../constants";
import type { Component } from "../types";

/**
 * Executes a function within the scope of a specific component.
 *
 * @param {Component} component - The component context to switch to.
 * @param {() => T} fn - The function to execute.
 * @returns {T} The result of the function.
 * @internal
 */
export const withScope = <T>(component: Component, fn: () => T): T => {
  const state = getAppState();
  const previous = state.getData<Component>(DATA_KEY_COMPONENT_STACK) || null;
  try {
    state.setData(DATA_KEY_COMPONENT_STACK, component);
    return fn();
  } catch (error) {
    console.warn(error);
    return null as T;
  } finally {
    state.setData(DATA_KEY_COMPONENT_STACK, previous);
  }
};
