import { setupAppState } from "./app-state";
import { enableClientMode } from "./client-mode";
import { setupTestLifecycle } from "./lifecycle";
import { mockNavigator } from "./mock";

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
