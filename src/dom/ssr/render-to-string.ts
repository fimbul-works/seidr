import type { SeidrComponent } from "../component.js";
import { setActiveSSRScope, SSRScope } from "./ssr-scope.js";
import type { SSRRenderResult } from "./types.js";

/**
 * Renders a component to an HTML string with automatic hydration data capture.
 *
 * This function:
 * 1. Creates or uses the provided SSR scope
 * 2. Sets the scope as active (enables auto-registration)
 * 3. Executes the component function (Seidr instances auto-register)
 * 4. Captures hydration data (observables, bindings, and dependency graph)
 * 5. Returns HTML string with hydration data
 * 6. Cleans up the scope
 *
 * @param component - Function that returns the root HTMLElement or ServerHTMLElement
 * @param scope - Optional existing SSR scope (creates new one if not provided)
 *
 * @returns Object containing HTML string and hydration data
 *
 * @example
 * ```typescript
 * const count = new Seidr(42);
 * const doubled = count.as(n => n * 2);
 *
 * const App = () => {
 *   return $('div', {}, [
 *     $('span', {}, [`Count: ${count.value}`]),
 *     $('span', {}, [`Doubled: ${doubled.value}`]),
 *   ]);
 * };
 *
 * const { html, hydrationData } = renderToString(App);
 * // hydrationData.observables contains only { 0: 42 }
 * // hydrationData.bindings maps element IDs to their reactive bindings
 * // hydrationData.graph contains the dependency graph
 * // doubled is not included in observables because isDerived = true
 *
 * // The HTML and hydrationData can be sent to the client for hydration
 * ```
 */
export function renderToString<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  scope?: SSRScope,
): SSRRenderResult {
  // Create new scope if not provided
  const activeScope = scope ?? new SSRScope();

  // Set scope as active to enable auto-registration in Seidr constructor
  setActiveSSRScope(activeScope);

  try {
    // Create component (Seidr instances will auto-register during creation)
    const component = componentFactory();

    // Convert to HTML string
    const html = String(component.element);

    // Capture hydration data (observables, bindings, graph) BEFORE destroying component
    const hydrationData = activeScope.captureHydrationData();

    // Destroy component to clean up scope bindings
    component.destroy();

    return { html, hydrationData };
  } finally {
    // Always clear active scope, even if component throws
    setActiveSSRScope(undefined);

    // Clear scope if we created it (captureState already cleared observables)
    if (!scope) {
      activeScope.clear();
    }
  }
}
