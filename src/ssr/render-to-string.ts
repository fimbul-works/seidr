import { wrapComponent } from "../component";
import type { SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { runWithRenderContext } from "../render-context/render-context.node";
import { clearPathCache } from "../router";
import { clearSSRScope, SSRScope, setActiveSSRScope } from "./ssr-scope";
import { captureRenderContextState, clearRenderContextState } from "./state";
import type { SSRRenderResult } from "./types";

/**
 * Options for rendering a component to string during SSR.
 */
export interface RenderToStringOptions {
  /** Optional existing SSR scope (creates new one if not provided) */
  scope?: SSRScope;

  /** Initial URL path for routing (defaults to "/") */
  path?: string;
}

/**
 * Renders a component to an HTML string with hydration data capture.
 *
 * This function:
 * 1. Creates or uses the provided SSR scope
 * 2. Sets the scope as active (enables auto-registration)
 * 3. Initializes the current path in RenderContext (for routing)
 * 4. Executes the component function (Seidr instances auto-register)
 * 5. Captures hydration data (observables, bindings, and dependency graph)
 * 6. Returns HTML string with hydration data
 * 7. Cleans up the scope
 *
 * @template C - SeidrComponent type
 *
 * @param {() => C} factory - Component function to render
 * @param {RenderToStringOptions | SSRScope} [optionsOrScope] - Options object or legacy scope parameter
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString<C extends SeidrNode>(
  factory: () => C,
  optionsOrScope?: RenderToStringOptions | SSRScope,
): Promise<SSRRenderResult> {
  // Normalize options to handle both legacy scope parameter and new options object
  let options: RenderToStringOptions;
  if (optionsOrScope && typeof optionsOrScope === "object" && "captureHydrationData" in optionsOrScope) {
    // Legacy: SSRScope object passed directly
    options = { scope: optionsOrScope };
  } else {
    // New: options object or undefined
    options = optionsOrScope ?? {};
  }

  return await runWithRenderContext(async () => {
    const ctx = getRenderContext();

    if (!ctx) {
      throw new Error("No render context available. This should not happen - please report this bug.");
    }

    // Initialize current path in RenderContext if provided
    if (options.path !== undefined) {
      ctx.currentPath = options.path;
    }

    // Create new scope if not provided
    const activeScope = options.scope ?? new SSRScope();

    // Set promise tracker to allow deeply nested components to register async work
    ctx.onPromise = (p) => activeScope.addPromise(p);

    // Set scope as active to enable auto-registration in Seidr constructor
    setActiveSSRScope(activeScope);

    try {
      // Create component (Seidr instances will auto-register during creation)
      const comp = wrapComponent(factory)();

      // Wait for any async work registered via inServer()
      await activeScope.waitForPromises();

      // Convert to HTML string
      // console.log("DEBUG: comp.element type:", typeof comp.element, comp.element.constructor?.name);
      const html = String(comp.element);
      if (html === "[object Object]") {
        console.error("DEBUG: comp.element serialized to [object Object]", comp.element);
      }

      // Capture hydration data (observables, bindings, graph) BEFORE destroying component
      const hydrationData = {
        ...activeScope.captureHydrationData(),
        // Capture state values for this render context
        state: captureRenderContextState(ctx.ctxID),
        // Capture render context ID for client-side marker matching
        ctxID: ctx.ctxID,
      };

      // Destroy component to clean up scope bindings
      comp.destroy();

      // Clear the render context state
      clearRenderContextState(ctx.ctxID);

      // Clear the path cache for this render context
      clearPathCache(ctx.ctxID);

      return { html, hydrationData };
    } finally {
      // Always clear active scope, even if component throws
      setActiveSSRScope(undefined);

      // Always clean up scope from global map to prevent memory leaks
      clearSSRScope(ctx.ctxID);

      // Clear scope if we created it (captureState already cleared observables)
      if (!options.scope) {
        activeScope.clear();
      }
    }
  });
}
