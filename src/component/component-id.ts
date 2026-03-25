import { getAppState } from "../app-state/app-state";
import { fastMixHash } from "../util/fast-mix-hash";

/**
 * Internal key used to override the component ID for the current component context.
 */
const DATA_COMPONENT_ID = "seidr_internal:id_override";

/**
 * Stores a component ID override in the app state.
 * @param {unknown} value - The value to hash
 */
export const setNextComponentId = (value: unknown): void =>
  getAppState().setData(DATA_COMPONENT_ID, typeof value === "number" ? value : fastMixHash(value));

/**
 * Consumes the component ID override from the app state.
 * @returns {number | undefined} The component ID override
 */
export const consumeComponentId = (): number | undefined => {
  const appState = getAppState();
  const forcedId = appState.getData<number>(DATA_COMPONENT_ID);
  if (forcedId !== undefined) {
    appState.deleteData(DATA_COMPONENT_ID);
  }
  return forcedId;
};
