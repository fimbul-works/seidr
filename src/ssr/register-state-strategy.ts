import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_STATE } from "../seidr/constants.js";
import { Seidr } from "../seidr/seidr.js";
import { unwrapSeidr } from "../seidr/unwrap-seidr.js";

/**
 * Registers the default Seidr state hydration strategy.
 */
export const registerStateStrategy = (): void => {
  const appState = getAppState();
  appState.defineDataStrategy(
    DATA_KEY_STATE,
    // Capture function: extracts serializable values from all root Seidr instances
    () => {
      const captured: Record<string, any> = {};

      const observables = appState.getData<Map<string, Seidr>>(DATA_KEY_STATE);
      if (observables) {
        for (const [id, seidr] of observables.entries()) {
          // Skip derived observables and those marked with hydrate: false
          if (seidr.isDerived || !seidr.options.hydrate) {
            continue;
          }
          captured[id] = unwrapSeidr(seidr.value);
        }
      }

      return captured;
    },
    // Restore function: rehydrates Seidr instances from captured data
    (capturedState: Record<string, any>) => {
      const observables = appState.getData<Map<string, Seidr>>(DATA_KEY_STATE) ?? new Map<string, Seidr>();

      for (const [id, value] of Object.entries(capturedState)) {
        const existing = observables.get(id);
        if (existing) {
          existing.value = value;
        } else {
          observables.set(id, new Seidr(value, { id }));
        }
      }

      appState.setData(DATA_KEY_STATE, observables);
    },
  );
};
