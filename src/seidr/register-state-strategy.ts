import type { AppState } from "../app-state/types.js";
import { DATA_KEY_STATE, noHydrate } from "./constants.js";
import { Seidr } from "./seidr.js";
import { unwrapSeidr } from "./unwrap-seidr.js";

/**
 * Registers the default Seidr state hydration strategy in the provided AppState.
 *
 * @param {AppState} state - The AppState instance to register the strategy in
 */
export function registerStateStrategy(state: AppState): void {
  state.defineDataStrategy(
    DATA_KEY_STATE,
    // Capture function: extracts serializable values from all root Seidr instances
    () => {
      const states = state.getData<Record<string, Seidr>>(DATA_KEY_STATE) ?? {};
      const captured: Record<string, any> = {};

      for (const [id, seidr] of Object.entries(states)) {
        // Skip derived observables and those marked with hydrate: false
        if (seidr.isDerived || seidr.options.hydrate === false) {
          continue;
        }

        captured[id] = unwrapSeidr(seidr.value);
      }

      return captured;
    },
    // Restore function: rehydrates Seidr instances from captured data
    (capturedState: Record<string, any>) => {
      const states = state.getData<Record<string, Seidr>>(DATA_KEY_STATE) ?? {};

      for (const [id, value] of Object.entries(capturedState)) {
        const existing = states[id];
        if (existing) {
          existing.value = value;
        } else {
          // Creating a new Seidr with the ID will automatically register it in the AppState
          // since the constructor is singleton-aware.
          new Seidr(value, { id, ...noHydrate });
        }
      }
    },
  );
}
