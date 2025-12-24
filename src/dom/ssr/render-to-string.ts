import type { SeidrComponent } from "../component.js";
import { popSSRScope, pushSSRScope } from "./render-stack.js";
import { SSRScope } from "./ssr-scope.js";
import type { SSRRenderResult } from "./types.js";

/**
 * Renders a component to an HTML string with automatic state capture.
 *
 * This function:
 * 1. Creates or uses the provided SSR scope
 * 2. Pushes the scope onto the render stack (enables auto-registration)
 * 3. Executes the component function (Seidr instances auto-register)
 * 4. Captures state from root observables
 * 5. Returns HTML string with embedded state
 * 6. Cleans up the scope
 *
 * @param component - Function that returns the root HTMLElement or ServerHTMLElement
 * @param scope - Optional existing SSR scope (creates new one if not provided)
 *
 * @returns Object containing HTML string and captured state
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
 * const { html, state } = renderToString(App);
 * // state.observables contains only { [count.id]: 42 }
 * // doubled is not included because isDerived = true
 *
 * // The HTML can be sent to the client, and the state used for hydration
 * ```
 */
export function renderToString<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  scope?: SSRScope,
): SSRRenderResult {
  // Create new scope if not provided
  const activeScope = scope ?? new SSRScope();

  // Push scope to enable auto-registration in Seidr constructor
  pushSSRScope(activeScope);

  try {
    // Create component (Seidr instances will auto-register during creation)
    const component = componentFactory();

    // Convert to HTML string
    const html = String(component.element);

    // Capture state (only root observables) BEFORE destroying component
    const state = activeScope.captureState();

    // Destroy component to clean up scope bindings
    component.destroy();

    return { html, state };
  } finally {
    // Always pop scope, even if component throws
    popSSRScope();

    // Clear scope if we created it (captureState already cleared observables)
    if (!scope) {
      activeScope.clear();
    }
  }
}
