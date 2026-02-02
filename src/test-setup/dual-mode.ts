import { afterAll, beforeAll, describe } from "vitest";
import { type DOMFactory, getDOMFactory } from "../dom-factory";
import type { SeidrElement } from "../element";
import { enableClientMode, enableSSRMode } from "../test-setup";

/**
 * Interface for the context provided to dual-mode tests.
 */
export interface DualModeContext {
  mode: "Browser" | "SSR";
  isSSR: boolean;
  getDOMFactory: () => DOMFactory;
}

/**
 * Helper to run tests against both Browser (JSDOM) and SSR (Node) environments.
 *
 * It respects the SEIDR_RENDER_MODE environment variable:
 * - "browser": Runs only browser tests
 * - "ssr": Runs only SSR tests
 * - unset / other: Runs both
 *
 * @param name - Suite name
 * @param fn - Test function receiving the context
 */
export function describeDualMode(name: string, fn: (context: DualModeContext) => void) {
  const envMode = process.env.SEIDR_RENDER_MODE?.toLowerCase();

  const modes = [
    {
      name: "Browser" as const,
      value: "browser",
      setup: enableClientMode,
      isSSR: false,
    },
    {
      name: "SSR" as const,
      value: "ssr",
      setup: enableSSRMode,
      isSSR: true,
    },
  ];

  // Filter modes if env var is set
  const activeModes = modes.filter((m) => !envMode || envMode === m.value || envMode === "both");

  if (activeModes.length === 0) {
    console.warn(`SEIDR_RENDER_MODE="${envMode}" matched no modes. Running none.`);
  }

  describe.each(activeModes)(`${name} ($name)`, (mode) => {
    let cleanup: () => void;

    beforeAll(() => {
      cleanup = mode.setup();
    });

    afterAll(() => {
      if (cleanup) cleanup();
    });

    fn({
      mode: mode.name,
      isSSR: mode.isSSR,
      getDOMFactory: () => {
        // getDOMFactory is a mutable export updated by setup()
        return getDOMFactory();
      },
    });
  });
}
