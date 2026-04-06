import { setupAppState } from "./app-state.js";
import { enableClientMode } from "./client-mode.js";
import { setupTestLifecycle } from "./lifecycle.js";
import { mockNavigator } from "./mock.js";

/**
 * Performs the default test setup for Seidr.
 * This is used by the vitest.config.ts to ensure a sane default environment.
 */
export function performDefaultSetup() {
  setupAppState();
  setupTestLifecycle();
  mockNavigator();
  // Default to client mode for most tests
  enableClientMode();
}

// Execute setup
performDefaultSetup();
