import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
  if (process.env.SEIDR_SKIP_DUAL_MODE === "true") {
    describe.skip(name, () => {
      // Skipped
    });
    return;
  }
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

/**
 * Renders a node or component to its HTML string representation.
 * Handles both Browser (DOM) nodes and SSR (ServerNode) nodes.
 *
 * @param node - The node, element, or component to render
 * @returns HTML string
 */
export function renderToHtml(node: any, depth = 0): string {
  if (depth > 100) {
    console.error("renderToHtml: possible circular reference detected");
    return "[Circular]";
  }
  if (node === null || node === undefined) return "";

  // Handle SeidrComponent
  if (node && typeof node === "object" && "element" in node) {
    node = node.element;
  }

  // Handle SSR nodes and SeidrFragments which have a custom toString()
  // We check if it's NOT a native DOM node that returns [object ...]
  if (typeof node.toString === "function") {
    const str = node.toString();
    if (str !== "[object HTMLElement]" && !str.startsWith("[object HTML")) {
      return str;
    }
  }

  // Handle Browser/JSDOM nodes
  if (typeof window !== "undefined") {
    if (node instanceof Element) {
      return node.outerHTML;
    }
    if (node instanceof Text) {
      return node.textContent || "";
    }
    if (node instanceof Comment) {
      return `<!--${node.nodeValue}-->`;
    }
    if (node instanceof DocumentFragment) {
      const div = document.createElement("div");
      div.appendChild(node.cloneNode(true));
      return div.innerHTML;
    }
  }

  // Handle fragments without native clones (SSR or SeidrFragment)
  if (node && typeof node === "object" && "nodes" in node && Array.isArray(node.nodes)) {
    return node.nodes.map((n: any) => renderToHtml(n, depth + 1)).join("");
  }

  return String(node);
}

/**
 * Automates parity checking between Browser and SSR by running a factory in both modes
 * and comparing the resulting HTML.
 *
 * @param name - Test name
 * @param factory - Function that returns a SeidrNode or SeidrComponent
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

    // 3. Compare
    expect(ssrHtml).toBe(clientHtml);
  });
}
