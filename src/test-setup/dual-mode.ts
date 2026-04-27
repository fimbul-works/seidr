import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDocument } from "../dom/get-document.js";
import { enableClientMode } from "./client-mode.js";
import { normalizeHtml, renderToHtml } from "./dom.js";
import { enableSSRMode } from "./ssr-mode.js";

/**
 * Interface for the context provided to dual-mode tests.
 */
export interface DualModeContext {
  mode: "Browser" | "SSR";
  isSSR: boolean;
  getDocument: () => Document;
}

/**
 * Helper to run tests against both Browser (JSDOM) and SSR (Node) environments.
 */
export function describeDualMode(name: string, fn: (context: DualModeContext) => void) {
  if (process.env.SEIDR_TEST_SKIP_DUAL_MODE === "true") {
    describe.skip(name, () => {});
    return;
  }

  const envMode = process.env.SEIDR_TEST_RENDER_MODE?.toLowerCase();

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
    console.warn(`SEIDR_TEST_RENDER_MODE="${envMode}" matched no modes. Running none.`);
  }

  describe.each(activeModes)(`${name} ($name)`, (mode) => {
    let cleanup: () => void;

    // Use beforeAll for environment setup to avoid polluting collection phase
    beforeAll(() => {
      cleanup = mode.setup();
    });

    afterAll(() => {
      if (cleanup) cleanup();
    });

    fn({
      mode: mode.name,
      isSSR: mode.isSSR,
      getDocument: () => getDocument(),
    });
  });
}

/**
 * Automates parity checking between Browser and SSR by running a factory in both modes
 * and comparing the resulting HTML.
 *
 * @param name - Test name
 * @param factory - Function that returns a SeidrNode or Component
 */
export function itHasParity(name: string, factory: () => any) {
  it(name, () => {
    // 1. Run in Browser mode
    const cleanupClient = enableClientMode();
    let clientHtml = "";
    try {
      clientHtml = renderToHtml(factory());
    } finally {
      cleanupClient();
    }

    // 2. Run in SSR mode
    const cleanupSSR = enableSSRMode();
    let ssrHtml = "";
    try {
      ssrHtml = renderToHtml(factory());
    } finally {
      cleanupSSR();
    }

    // 3. Compare normalized output
    expect(normalizeHtml(ssrHtml)).toBe(normalizeHtml(clientHtml));
  });
}
