import { wrapComponent } from "../component/wrap-component";
import { getDOMFactory, setInternalDOMFactory } from "../dom/dom-factory";
import { getSSRDOMFactory } from "../dom/dom-factory.node";
import type { SeidrNode } from "../element/types";
import { getRenderContext } from "../render-context";
import { runWithRenderContext } from "../render-context/render-context.node";
import { clearPathCache } from "../router/get-current-path";
import { SeidrError } from "../types";
import { isArray, isDOMNode, isStr } from "../util/type-guards/index";
import { clearSSRScope, SSRScope, setSSRScope } from "./ssr-scope";
import { captureGlobalState, clearGlobalState } from "./state";
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
        throw new SeidrError("No render context available.");
      }

      if (isStr(options.path)) {
        ctx.currentPath = options.path;
      }

      const activeScope = options.scope ?? new SSRScope();
      ctx.onPromise = (p) => activeScope.addPromise(p);
      setSSRScope(activeScope);

      try {
        const comp = wrapComponent(factory)();

        // Ensure root is attached to something so it can render content (especially for marker-based components)
        // We use a temporary div as a container for initial rendering.
        const doc = getDOMFactory().createElement("div");
        const nodes = isArray(comp.element) ? comp.element : [comp.element];
        nodes.filter(isDOMNode).forEach((n) => doc.appendChild(n as any));

        // Trigger attachment life-cycle
        comp.scope.attached(doc as any);

        await activeScope.waitForPromises();

        // Use innerHTML to get the stringified content without the wrapping div
        const html = doc.innerHTML;

        const hydrationData = {
          ...activeScope.captureHydrationData(),
          state: captureGlobalState(ctx.ctxID),
          ctxID: ctx.ctxID,
        };

        comp.unmount();
        clearGlobalState(ctx.ctxID);
        clearPathCache(ctx.ctxID);

        return { html, hydrationData };
      } finally {
        setSSRScope(undefined);
        clearSSRScope(ctx.ctxID);
        if (ctx.markers) {
          ctx.markers.clear();
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
