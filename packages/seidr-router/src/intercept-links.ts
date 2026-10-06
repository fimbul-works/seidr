import { $queryAll, getDocument, isHTMLElement, isNullish, isServer } from "@fimbul-works/seidr";
import { getRouterState } from "./get-router-state.js";
import { useNavigate } from "./hooks/use-navigate.js";

/**
 * Intercepts anchor (`<a>`) tag clicks within a given DOM element (or the document body)
 * and navigates using the Seidr router instead of causing a full-page reload.
 *
 * Applicable for dynamic content (such as Markdown-rendered HTML) on both client and server.
 *
 * Criteria for intercepting a link:
 * 1. The link does not have a "target" or "download" attribute.
 * 2. The link does not already have an `onclick` handler attached.
 * 3. The link URL path is relative OR its origin matches the current router's origin.
 *
 * Special mouse clicks (Ctrl, Cmd/Meta, Shift, or middle-click) pass through without interception.
 *
 * @param {Element} [root] - The root element to scan for anchor tags. Defaults to document.body.
 * @throws {SeidrError} If the router system is not initialized.
 */
export const interceptLinks = (root: Element = getDocument().body): void => {
  const routerState = getRouterState();

  if (isServer()) {
    return;
  }

  const navigate = useNavigate();
  const currentUrl = routerState.url();

  const anchors: HTMLAnchorElement[] = $queryAll<HTMLAnchorElement>("a", root);
  if (isHTMLElement<"a">(root) && root.tagName?.toLowerCase() === "a") {
    anchors.push(root);
  }

  for (const link of anchors) {
    // Skip if link has a "target" or "download" attributes, or an existing onclick handler
    if (link.hasAttribute("target") || link.hasAttribute("download") || !isNullish(link.onclick)) {
      continue;
    }

    // Skip if no href is present
    const href = link.getAttribute("href");
    if (!href) {
      continue;
    }

    // Check if path is relative OR origin matches current router
    const isRelative = !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href) && !href.startsWith("//");
    let isSameOrigin = false;

    try {
      const parsed = new URL(href, currentUrl.href);
      isSameOrigin = parsed.origin === currentUrl.origin;
    } catch {
      isSameOrigin = false;
    }

    if (!isRelative && !isSameOrigin) {
      continue;
    }

    // Add onclick handler that prevents default navigation and uses useNavigate
    link.onclick = (event: MouseEvent | Event): void => {
      // Allow ctrl, meta, shift, or middle click to pass through
      if (event instanceof MouseEvent && (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0)) {
        return;
      }

      event.preventDefault();
      navigate(href);
    };
  }
};
