import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import type { Value } from "../observable/value.js";
import { createValue } from "../observable/value.js";

/**
 * Registers the default Value state hydration strategy.
 */
export const registerStateStrategy = (): void => {
  const appState = getAppState();
  appState.defineDataStrategy(
    DATA_KEY_STATE,
    // Capture function: extracts serializable values from all root Value instances
    () => {
      const captured: Record<string, any> = {};

      const values = appState.getData<Map<string, Value>>(DATA_KEY_STATE);
      if (values) {
        for (const [id, value] of values.entries()) {
          // Skip derived values and those marked with hydrate: false
          if (value.isDerived || !value.hydrate) {
            continue;
          }
          captured[id] = unwrapValue(value());
        }
      }

      return captured;
    },
    // Restore function: rehydrates Value instances from captured data
    (capturedState: Record<string, any>) => {
      const values = appState.getData<Map<string, Value>>(DATA_KEY_STATE) ?? new Map<string, Value>();

      for (const [id, val] of Object.entries(capturedState)) {
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
