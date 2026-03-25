import { getAppState } from "../../app-state/app-state";
import type { Component } from "../types";
import { COMPONENT_STACK_DATA_KEY } from "./constants";

/**
 * Get the current component from the component tree.
 * @returns {Component | null} Current Component cursor, or null.
 */
export const getCurrentComponent = (): Component | null =>
  getAppState().getData<Component>(COMPONENT_STACK_DATA_KEY) || null;
