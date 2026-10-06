import { afterEach } from "vitest";
import { clearTestAppState } from "./app-state.js";

/**
 * Registers the global afterEach cleanup hook for Vitest.
 * This should be called explicitly in your test setup if you want automatic cleanup.
 */
export function setupTestLifecycle() {
  afterEach(() => {
    // Reset browser context for next test
    clearTestAppState();

    // Clean up DOM after each test
    if (typeof document !== "undefined") {
      document.body.innerHTML = "";
      document.head.innerHTML = "";
    }
  });
}
