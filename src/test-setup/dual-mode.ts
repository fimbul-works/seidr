import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDocument } from "../dom";
import { escapeHTML } from "../util/escape";
import { isArray } from "../util/type-guards";
import { enableClientMode, enableSSRMode } from ".";

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
      getDocument: () => getDocument(),
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

  // Handle Component
  if (node && typeof node === "object" && "element" in node) {
    node = node.element;
  }

  // Handle Browser/JSDOM nodes
  if (typeof window !== "undefined") {
    if (node instanceof Element) {
      return node.outerHTML;
    }
    if (node instanceof Text) {
      return escapeHTML(node.textContent || "");
    }
    if (node instanceof Comment) {
      return `<!--${node.nodeValue}-->`;
    }
  }

  // Handle SSR nodes
  // We check if it's NOT a native DOM node that returns [object ...]
  if (typeof node.toString === "function") {
    const str = node.toString();
    if (str !== "[object HTMLElement]" && !str.startsWith("[object HTML")) {
      return str;
    }
  }

  // Handle arrays (SSR)
  if (isArray(node)) {
    return node.map((n: any) => renderToHtml(n, depth + 1)).join("");
  }

  return String(node);
}

/**
 * Normalizes an HTML string for comparison.
 * Sorts attributes and normalizes whitespace.
 *
 * @param html - RAW HTML string
 * @returns Normalized HTML string
 */
function normalizeHtml(html: string): string {
  if (!html) return "";

  // 1. Sort attributes within tags
  let normalized = html.replace(/<([a-z0-9-]+)([^>]*)>/gi, (_match, tag, attrs) => {
    // Handle self-closing end slash
    const isSelfClosing = attrs.trim().endsWith("/");
    let cleanAttrs = attrs.trim();
    if (isSelfClosing) {
      cleanAttrs = cleanAttrs.slice(0, -1).trim();
    }

    // Split attributes by space, but respect quoted values
    // Regex matches: key="value" or key='value' or key
    const attrMatches = cleanAttrs.match(/(?:[^\s"'=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"']+))?)/g) || [];

    // Normalize boolean attributes: transform 'key=""' to 'key'
    const normalizedAttrList = attrMatches.map((attr: string) => {
      if (attr.endsWith('=""')) {
        const key = attr.slice(0, -3);
        // We can be aggressive and strip it for any attribute for comparison purposes,
        // or just for-sure booleans. Let's do any empty string attribute.
        return key;
      }
      return attr;
    });

    const sortedAttrs = normalizedAttrList.sort().join(" ");

    // We normalize to NO slash for self-closing tags to match JSDOM,
    // as Seidr SSR uses slashes but JSDOM doesn't for HTML5.
    return `<${tag.toLowerCase()}${sortedAttrs ? ` ${sortedAttrs}` : ""}>`;
  });

  // 2. Normalize case for closing tags
  normalized = normalized.replace(/<\/([a-z0-9-]+)>/gi, (_match, tag) => {
    return `</${tag.toLowerCase()}>`;
  });

  // 3. Normalize whitespace
  return normalized.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
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
