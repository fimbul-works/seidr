import { getAppState } from "../app-state/app-state";
import { DATA_NEXT_COMPONENT_ID } from "./constants";

/**
 * Consumes the component ID override from the app state.
 * @returns {number | undefined} The component ID override
 */
export const consumeComponentId = (): number | undefined => {
  const appState = getAppState();
  const nextId = appState.getData<number>(DATA_NEXT_COMPONENT_ID);
  if (nextId !== undefined) {
    appState.deleteData(DATA_NEXT_COMPONENT_ID);
  }
  return nextId;
};
