import { expect } from "vitest";
import { escapeHTML } from "../ssr/util/escape-string.js";
import { isArray, isEmpty, isFn, isObj } from "../util/type-guards/primitive-types.js";

/**
 * Renders a node or component to its HTML string representation.
 * Handles both Browser (DOM) nodes and SSR (ServerNode) nodes.
 *
 * @param node - The node, element, or component to render
 * @param depth - Recursion depth limit
 * @returns HTML string
 */
export function renderToHtml(node: any, depth = 0): string {
  if (depth > 100) {
    console.error("renderToHtml: possible circular reference detected");
    return "[Circular]";
  }
  if (isEmpty(node)) return "";

  // Handle Component
  if (isObj(node) && "element" in node) {
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
  if (isFn(node?.toString)) {
    const s = node.toString();
    if (s !== "[object HTMLElement]" && !s.startsWith("[object HTML")) {
      return s;
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
export function normalizeHtml(html: string): string {
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
    const attrMatches = cleanAttrs.match(/(?:[^\s"'=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"']+))?)/g) || [];

    // Normalize boolean attributes: transform 'key=""' to 'key'
    const normalizedAttrList = attrMatches.map((attr: string) => {
      if (attr.endsWith('=""')) {
        const key = attr.slice(0, -3);
        return key;
      }
      return attr;
    });

    const sortedAttrs = normalizedAttrList.sort().join(" ");

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
 * Asserts that two HTML strings are equivalent after normalization.
 */
export function expectHtmlToBe(actual: string, expected: string) {
  expect(normalizeHtml(actual)).toBe(normalizeHtml(expected));
}
