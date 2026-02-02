import { wrapComponent } from "../component";
import { getDOMFactory, setInternalDOMFactory } from "../dom-factory";
import { getSSRDOMFactory } from "../dom-factory/dom-factory.node";
import type { SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { runWithRenderContext } from "../render-context/render-context.node";
import { clearPathCache } from "../router";
import { COMMENT_NODE, ELEMENT_NODE } from "../types";
import { clearSSRScope, SSRScope, setActiveSSRScope } from "./ssr-scope";
import { captureRenderContextState, clearRenderContextState } from "./state";
import type { SSRRenderResult } from "./types";

/**
 * Traverses the server DOM tree to record paths to fragment markers.
 * @param node Root node to traverse
 * @param currentPath Path from root
 * @param matches Map to store matches
 */
function captureFragmentPaths(node: any, currentPath: number[], matches: Record<string, number[]>) {
  if (!node.childNodes || node.childNodes.length === 0) return;

  // Use Array.from or loop if it's a NodeList-like object
  // ServerNode childNodes is a NodeList but we can iterate it
  const children = node.childNodes;
  const len = children.length;

  for (let i = 0; i < len; i++) {
    const child = children[i];
    if (child.nodeType === COMMENT_NODE) {
      const data = child.data || "";
      if (data.startsWith("s:")) {
        const id = data.slice(2);
        matches[id] = [...currentPath, i];
      }
    } else if (child.nodeType === ELEMENT_NODE) {
      // Recurse into elements
      captureFragmentPaths(child, [...currentPath, i], matches);
    }
  }
}

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

        // Capture fragment paths
        const fragmentPaths: Record<string, number[]> = {};
        captureFragmentPaths(comp.element, [], fragmentPaths);

        const hydrationData = {
          ...activeScope.captureHydrationData(),
          state: captureRenderContextState(ctx.ctxID),
          ctxID: ctx.ctxID,
          fragments: fragmentPaths,
        };

        comp.element.remove();
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
