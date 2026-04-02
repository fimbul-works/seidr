import { getAppState } from "../../app-state/app-state";
import { SeidrError } from "../../types";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "../../constants";

/**
 * Get the current component
 * @returns {Component} Current Component.
 */
export const useScope = (): Component => {
  const component = getAppState().getData<Component>(COMPONENT_STACK_DATA_KEY);
  if (!component) {
    throw new SeidrError("useScope called outside of component hierarchy");
  }
  return component;
};
