import type { SeidrComponent } from "../core/index.js";
import { getRenderContext } from "../core/render-context-contract.js";
import { runWithRenderContextSync } from "../render-context.node.js";
import { SSRScope, setActiveSSRScope } from "./ssr-scope.js";
import { captureRenderContextState, clearRenderContextState } from "./state.js";
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
 * @template C - SeidrComponent type
 *
 * @param {(...args: any) => C} componentFactory - Function that returns the root HTMLElement or ServerHTMLElement
 * @param {SSRScope} [scope] - Optional existing SSR scope (creates new one if not provided)
 *
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 *
 * @example
 * ```typescript
 * const count = new Seidr(42);
 * const doubled = count.as(n => n * 2);
 *
 * function App() {
 *   return component((state) => {
 *     return $('div', {}, [
 *       $('span', {}, [`Count: ${count.value}`]),
 *       $('span', {}, [`Doubled: ${doubled.value}`]),
 *     ]);
 *   });
 * };
 *
 * app.get('*', async (req, res) => {
 *   // The HTML and hydrationData can be sent to the client for hydration
 *   const { html, hydrationData } = await runWithRenderContext(async () => {
 *     return await renderToString(App);
 *   });
 *   res.send(html);
 * });
 * ```
 */
export async function renderToString<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  scope?: SSRScope,
): Promise<SSRRenderResult> {
  const ctx = getRenderContext();

  // Bubblegum patch for test convenience: Auto-create RenderContext in test mode
  const isTestMode = process.env.SEIDR_TEST_SSR === "true";
  const hasValidContext = typeof ctx?.renderContextID !== "undefined";

  if (!hasValidContext) {
    if (isTestMode) {
      // In test mode, auto-wrap with a RenderContext for convenience
      return runWithRenderContextSync(() => renderToString(componentFactory, scope));
    }
    throw new Error("Invalid RenderContext");
  }

  // Create new scope if not provided
  const activeScope = scope ?? new SSRScope();

  // Set scope as active to enable auto-registration in Seidr constructor
  setActiveSSRScope(activeScope);

  try {
    // Create component (Seidr instances will auto-register during creation)
    const component = componentFactory();

    // Add data-seidr-id attribute to root element for hydration
    // This attribute carries the render context ID from server to client
    if (typeof component.element.dataset !== "undefined") {
      component.element.dataset["seidr-id"] = String(ctx.renderContextID);
    }

    // Convert to HTML string
    const html = String(component.element);

    // Capture hydration data (observables, bindings, graph) BEFORE destroying component
    const hydrationData = {
      renderContextID: ctx.renderContextID,
      ...activeScope.captureHydrationData(),
      // Capture State values for this render context
      state: captureRenderContextState(ctx.renderContextID),
    };

    // Destroy component to clean up scope bindings
    component.destroy();

    // Clear the render context state
    clearRenderContextState(ctx.renderContextID);

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
