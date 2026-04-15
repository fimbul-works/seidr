import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_COMPONENT_SCOPE } from "../constants.js";
import { SeidrError } from "../types.js";
import type { Component } from "./types.js";

/**
 * Get the current component
 * @returns {Component} Current Component.
 * @throws {SeidrError} if called outside of component hierarchy
 */
export function useScope(): Component {
  const component = getAppState().getData<Component>(DATA_KEY_COMPONENT_SCOPE);
  if (!component) {
    throw new SeidrError("useScope called outside of component hierarchy");
  }
  return component;
}
