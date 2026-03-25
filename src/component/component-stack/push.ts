import { getAppState } from "../../app-state/app-state";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "./constants";

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 */
export const push = (component: Component): void => getAppState().setData(COMPONENT_STACK_DATA_KEY, component);
