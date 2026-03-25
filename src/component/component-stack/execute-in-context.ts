import { getAppState } from "../../app-state/app-state";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "./constants";

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
  const previous = state.getData<Component>(COMPONENT_STACK_DATA_KEY) || null;
  try {
    state.setData(COMPONENT_STACK_DATA_KEY, component);
    return fn();
  } catch (error) {
    console.warn(error);
    return null as T;
  } finally {
    state.setData(COMPONENT_STACK_DATA_KEY, previous);
  }
};
