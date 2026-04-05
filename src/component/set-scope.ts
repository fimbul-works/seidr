import { getAppState } from "../app-state/app-state";
import { DATA_KEY_COMPONENT_SCOPE } from "../constants";
import type { Component } from "./types";

/**
 * Sets the active component scope.
 * @param {Component} component - The component to set as current.
 * @internal
 */
export const setScope = (component: Component | null): void => getAppState().setData(DATA_KEY_COMPONENT_SCOPE, component);
