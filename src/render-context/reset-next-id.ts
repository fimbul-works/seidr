import { getAppState } from "./render-context";

/**
 * Resets the next available ID for the AppState.
 * Used in tests to ensure consistent IDs.
 */
export const resetNextId = (): void => {
  try {
    const state = getAppState();
    state.sID = 0;
    state.cID = 0;
  } catch (_e) {
    // Ignore if no app state is available
  }
};
