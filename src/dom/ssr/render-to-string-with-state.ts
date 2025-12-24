import type { SeidrElementInterface } from "../element.js";
import { renderToString } from "./render-to-string.js";
import type { SSRScope } from "./ssr-scope.js";

/**
 * Renders a component to an HTML string with state embedded as data attribute.
 *
 * This is a convenience function that embeds the state directly in the HTML
 * for easy extraction on the client side.
 *
 * @param component - Function that returns the root HTMLElement or ServerHTMLElement
 * @param scope - Optional existing SSR scope
 * @param dataAttr - Attribute name for embedded state (default: "data-seidr-state")
 *
 * @returns HTML string with embedded state
 *
 * @example
 * ```typescript
 * const { html } = renderToStringWithState(App);
 * // Returns: <div data-seidr-state='{"observables:{..."}}'>...</div>
 *
 * // On client:
 * const container = document.querySelector('[data-seidr-state]');
 * const state = JSON.parse(container.dataset.seidrState);
 * ```
 */
export function renderToStringWithState(
  component: () => SeidrElementInterface | string,
  scope?: SSRScope,
  dataAttr: string = "data-seidr-state",
): string {
  const { html, state } = renderToString(component, scope);

  // Check if html already has a root element
  const hasRootElement = /^<[a-z][\s\S]*>/i.test(html);

  if (!hasRootElement) {
    // If no root element, wrap in a div
    return `<div ${dataAttr}='${JSON.stringify(state)}'>${html}</div>`;
  }

  // Inject state attribute into root element
  return html.replace(/^<([a-z][a-z0-9]*)([^>]*)>/i, (_, tag: string, attrs: string) => {
    return `<${tag}${attrs} ${dataAttr}='${JSON.stringify(state)}'>`;
  });
}
