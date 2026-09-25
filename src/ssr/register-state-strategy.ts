import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import type { Value } from "../observable/value.js";
import { createValue } from "../observable/value.js";
import { packHydrationState, unpackHydrationState } from "./util/state-tuple.js";

/**
 * Registers the default Value state hydration strategy.
 */
export const registerStateStrategy = (): void => {
  const appState = getAppState();
  appState.defineDataStrategy(
    DATA_KEY_STATE,
    // Capture function: extracts serializable values from all root Value instances into a deduplicated tuple array
    () => {
      const rawValues = new Map<string, any>();

      const values = appState.getData<Map<string, Value>>(DATA_KEY_STATE);
      if (values) {
        for (const [id, value] of values.entries()) {
          // Skip derived values and those marked with hydrate: false
          if (value.isDerived || !value.hydrate) {
            continue;
          }
          rawValues.set(id, unwrapValue(value()));
        }
      }

      return packHydrationState(rawValues);
    },
    // Restore function: rehydrates Value instances from captured data
    (capturedState: any) => {
      const values = appState.getData<Map<string, Value>>(DATA_KEY_STATE) ?? new Map<string, Value>();

      const stateMap: Map<string, any> = Array.isArray(capturedState)
        ? unpackHydrationState(capturedState)
        : new Map(Object.entries(capturedState ?? {}));

      for (const [id, val] of stateMap.entries()) {
        const existing = values.get(id);
        if (existing) {
          existing(val);
        } else {
          values.set(id, createValue(val, { id }));
        }
      }

      appState.setData(DATA_KEY_STATE, values);
    },
  );
};
