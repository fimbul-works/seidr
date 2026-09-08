import { getAppState } from "../../app-state/app-state.js";
import { DATA_KEY_COMPONENT_CURSOR } from "../../constants.js";
import type { SeidrComponent } from "../types.js";

/**
 * Sets the active component.
 *
 * @param {SeidrComponent} component - The component to set as current
 * @internal
 */
export const setComponentScope = (component: SeidrComponent | null) =>
  getAppState().setData(DATA_KEY_COMPONENT_CURSOR, component);

/**
 * Get the current component.
 *
 * @returns {SeidrComponent | null} Current component or null
 */
export const getComponentScope = (): SeidrComponent | null =>
  getAppState().getData<SeidrComponent>(DATA_KEY_COMPONENT_CURSOR) || null;
