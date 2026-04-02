import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_STACK } from "../../constants";
import { SeidrError } from "../../types";
import type { Component } from "../types";

/**
 * Get the current component
 * @returns {Component} Current Component.
 */
export const useScope = (): Component => {
  const component = getAppState().getData<Component>(DATA_KEY_COMPONENT_STACK);
  if (!component) {
    throw new SeidrError("useScope called outside of component hierarchy");
  }
  return component;
};
