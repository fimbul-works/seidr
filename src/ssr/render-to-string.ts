import type { SeidrComponent } from "../core/index";
import { getRenderContext } from "../core/render-context-contract";
import { runWithRenderContext } from "../render-context.node";
import { clearSSRScope, SSRScope, setActiveSSRScope } from "./ssr-scope";
import { captureRenderContextState, clearRenderContextState } from "./state";
import type { SSRRenderResult } from "./types";

/**
 * Renders a component to an HTML string with hydration data capture.
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
 * @param {(...args: any) => C} componentFactory - Function that returns SeidrComponent
 * @param {any} props - Props to be passed to the component
 * @param {SSRScope} [scope] - Optional existing SSR scope (creates new one if not provided)
 *
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 *
 * @example
 * ```typescript
 * import { renderToString } from '@fimbul-works/seidr/node';
 * import { $, component, Seidr, setState, createStateKey } from '@fimbul-works/seidr/node';
 *
 * function App() {
 *   return component((state) => {
 *     const count = new Seidr(0);
 *     return $('div', {}, [
 *       $('span', { textContent: count.as(n => `Count: ${n}`) })
 *     ]);
 *   });
 * };
 *
 * app.get('*', async (req, res) => {
 *   const { html, hydrationData } = await renderToString(App);
 *   res.send(html);
 * });
 * ```
 */
export async function renderToString<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  props?: any,
  scope?: SSRScope,
): Promise<SSRRenderResult> {
  return await runWithRenderContext(async () => {
    const ctx = getRenderContext();

    if (!ctx) {
      throw new Error("No render context available. This should not happen - please report this bug.");
    }

    // Create new scope if not provided
    const activeScope = scope ?? new SSRScope();

    // Set scope as active to enable auto-registration in Seidr constructor
    setActiveSSRScope(activeScope);

    try {
      // Create component (Seidr instances will auto-register during creation)
      const component = componentFactory(props);

      // Add data-seidr-id attribute to root element for hydration
      // Convert to HTML string
      const html = String(component.element);

      // Capture hydration data (observables, bindings, graph) BEFORE destroying component
      const hydrationData = {
        ...activeScope.captureHydrationData(),
        // Capture state values for this render context
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

      // Always clean up scope from global map to prevent memory leaks
      clearSSRScope(ctx.renderContextID);

      // Clear scope if we created it (captureState already cleared observables)
      if (!scope) {
        activeScope.clear();
      }
    }
  });
}
