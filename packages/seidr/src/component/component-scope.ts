import { getAppState } from "../app-state/get-app-state.js";
import type { SeidrComponent } from "./types.js";

/** Current component cursor data key. */
export const DATA_KEY_COMPONENT_CURSOR = "seidr.component.cursor";

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
