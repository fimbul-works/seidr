import { ON_PROMISE_DATA_KEY } from "../component/feature";
import { mountComponent } from "../component/util/mount-component";
import { wrapComponent } from "../component/wrap-component";
import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
import type { SeidrNode } from "../element/types";
import { serializeAppState } from "../render-context/feature";
import { getAppState } from "../render-context/render-context";
import { runWithAppState } from "../render-context/render-context.node";
import { PATH_DATA_KEY } from "../router/feature";
import { clearPathCache } from "../router/get-current-path";
import { SeidrError } from "../types";
import { isStr } from "../util/type-guards/index";
import { clearSSRScope, SSRScope, setSSRScope } from "./ssr-scope/index";
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
  return await runWithAppState(async () => {
    const prevFactory = getDocument;
    setInternalGetDocument(getSSRDocument);

    try {
      const state = getAppState();
      if (!state) {
        throw new SeidrError("No AppState available.");
      }

      if (isStr(options.path)) {
        state.setData(PATH_DATA_KEY, options.path);
      }

      const activeScope = options.scope ?? new SSRScope();
      setSSRScope(activeScope);
      state.setData(ON_PROMISE_DATA_KEY, (p: Promise<any>) => activeScope.addPromise(p));

      try {
        const comp = wrapComponent(factory)();

        // Ensure root is attached to something so it can render content (especially for marker-based components)
        // We use a temporary div as a container for initial rendering.
        const doc = getDocument().createElement("div");
        const anchor = getDocument().createComment("ssr-anchor");
        doc.appendChild(anchor);

        // Mount the component properly using the recursive mountComponent
        mountComponent(comp, anchor);

        await activeScope.waitForPromises();
        anchor.remove();

        // Use innerHTML to get the stringified content without the wrapping div
        const html = doc.innerHTML;

        const hydrationData = {
          ...activeScope.captureHydrationData(),
          data: serializeAppState(state),
          ctxID: state.ctxID,
        };

        comp.unmount();
        clearPathCache(state.ctxID);

        return { html, hydrationData };
      } finally {
        setSSRScope(undefined);
        clearSSRScope(state.ctxID);
        if (state.markers) {
          state.markers.clear();
        }
        if (!options.scope) {
          activeScope.clear();
        }
      }
    } finally {
      setInternalGetDocument(prevFactory);
    }
  });
}
