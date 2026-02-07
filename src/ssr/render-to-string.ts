import { wrapComponent } from "../component";
import { getDOMFactory, setInternalDOMFactory } from "../dom-factory";
import { getSSRDOMFactory } from "../dom-factory/dom-factory.node";
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
 * @param {() => C} factory - Component function to render
 * @param {RenderToStringOptions | SSRScope} [optionsOrScope] - Options object or legacy scope parameter
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString<C extends SeidrNode>(
  factory: () => C,
  optionsOrScope?: RenderToStringOptions | SSRScope,
): Promise<SSRRenderResult> {
  // Normalize options
  let options: RenderToStringOptions;
  if (optionsOrScope && typeof optionsOrScope === "object" && "captureHydrationData" in optionsOrScope) {
    options = { scope: optionsOrScope };
  } else {
    options = (optionsOrScope as RenderToStringOptions) ?? {};
  }

  return await runWithRenderContext(async () => {
    // Ensure we're using the SSR DOM factory during renderToString
    const prevFactory = getDOMFactory;
    setInternalDOMFactory(getSSRDOMFactory);

    try {
      const ctx = getRenderContext();
      if (!ctx) {
        throw new Error("No render context available.");
      }

      if (options.path !== undefined) {
        ctx.currentPath = options.path;
      }

      const activeScope = options.scope ?? new SSRScope();
      ctx.onPromise = (p) => activeScope.addPromise(p);
      setActiveSSRScope(activeScope);

      try {
        const comp = wrapComponent(factory)();
        await activeScope.waitForPromises();

        const html = (comp.element as any).outerHTML ?? String(comp.element);

        const hydrationData = {
          ...activeScope.captureHydrationData(),
          state: captureRenderContextState(ctx.ctxID),
          ctxID: ctx.ctxID,
        };

        comp.unmount();
        clearRenderContextState(ctx.ctxID);
        clearPathCache(ctx.ctxID);

        return { html, hydrationData };
      } finally {
        setActiveSSRScope(undefined);
        clearSSRScope(ctx.ctxID);
        if (!options.scope) {
          activeScope.clear();
        }
      }
    } finally {
      setInternalDOMFactory(prevFactory);
    }
  });
}
