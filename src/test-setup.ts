import { afterEach } from "vitest";

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

// Mock DOM environment for testing
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "test",
  },
  writable: true,
});

/**
 * SSR/Client Mode Test Utilities
 *
 * These utilities help toggle between SSR and client modes for testing.
 * They manage environment variables and window object state.
 */

interface TestEnvironmentState {
  seidrSSR?: string;
  vitest?: boolean;
  window: any;
}

/**
 * Enable SSR mode for testing
 * This sets environment variables to simulate server-side rendering
 *
 * @returns Cleanup function to restore previous state
 *
 * @example
 * ```ts
 * describe("SSR Tests", () => {
 *   beforeEach(() => {
 *     cleanupSSRMode = enableSSRMode();
 *   });
 *
 *   afterEach(() => {
 *     cleanupSSRMode();
 *   });
 * });
 * ```
 */
export function enableSSRMode(): () => void {
  // Save current state
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
  };

  // Enable SSR mode
  process.env.SEIDR_TEST_SSR = "true";

  // Return cleanup function
  return () => {
    if (currentState.seidrSSR !== undefined) {
      process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    if (currentState.vitest !== undefined) {
      (process.env as any).VITEST = currentState.vitest;
    } else {
      delete (process.env as any).VITEST;
    }

    if (currentState.window !== undefined) {
      (global as any).window = currentState.window;
    }
  };
}

/**
 * Enable client mode for testing
 * This clears environment variables to simulate client-side execution
 * and ensures window object is available
 *
 * @returns Cleanup function to restore previous state
 *
 * @example
 * ```ts
 * describe("Client Tests", () => {
 *   beforeEach(() => {
 *     cleanupClientMode = enableClientMode();
 *   });
 *
 *   afterEach(() => {
 *     cleanupClientMode();
 *   });
 * });
 * ```
 */
export function enableClientMode(): () => void {
  // Save current state
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
  };

  // Enable client mode
  delete process.env.SEIDR_TEST_SSR;
  delete (process.env as any).VITEST;

  // Ensure window is defined (jsdom provides it, but SSR tests might have deleted it)
  if (typeof window === "undefined") {
    (global as any).window = currentState.window || {};
  }

  // Return cleanup function
  return () => {
    if (currentState.seidrSSR !== undefined) {
      process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    if (currentState.vitest !== undefined) {
      (process.env as any).VITEST = currentState.vitest;
    } else {
      delete (process.env as any).VITEST;
    }

    if (currentState.window !== undefined) {
      (global as any).window = currentState.window;
    }
  };
}
