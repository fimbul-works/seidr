import { wrapComponent } from "../component";
import { getDOMFactory, setInternalDOMFactory } from "../dom-factory";
import { getSSRDOMFactory } from "../dom-factory/dom-factory.node";
import type { SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { runWithRenderContext } from "../render-context/render-context.node";
import { clearPathCache } from "../router";
import { isArr, isDOMNode, isStr } from "../util/type-guards";
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
 * @param {RenderToStringOptions} [options] - Optiona options object
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString<C extends SeidrNode>(
  factory: () => C,
  options: RenderToStringOptions = {},
): Promise<SSRRenderResult> {
  return await runWithRenderContext(async () => {
    const prevFactory = getDOMFactory;
    setInternalDOMFactory(getSSRDOMFactory);

    try {
      const ctx = getRenderContext();
      if (!ctx) {
        throw new Error("No render context available.");
      }

      if (isStr(options.path)) {
        ctx.currentPath = options.path;
      }

      const activeScope = options.scope ?? new SSRScope();
      ctx.onPromise = (p) => activeScope.addPromise(p);
      setActiveSSRScope(activeScope);

      try {
        const comp = wrapComponent(factory)();

        // Ensure root is attached to something so it can render content (especially for marker-based components)
        // We use a temporary div as a container for initial rendering.
        const doc = getDOMFactory().createElement("div");
        const nodes = isArr(comp.element) ? comp.element : [comp.element];
        nodes.filter(isDOMNode).forEach((n) => doc.appendChild(n as any));

        // Trigger attachment life-cycle
        comp.scope.attached(doc as any);

        await activeScope.waitForPromises();

        // Use innerHTML to get the stringified content without the wrapping div
        const html = doc.innerHTML;

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
        if (ctx.markerCache) {
          ctx.markerCache.clear();
        }
        if (!options.scope) {
          activeScope.clear();
        }
      }
    } finally {
      setInternalDOMFactory(prevFactory);
    }
  });
}
