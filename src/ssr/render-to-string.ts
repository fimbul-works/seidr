import { getAppState, setAppStateID } from "../app-state/app-state";
import { runWithAppState } from "../app-state/app-state.server";
import type { ComponentReturnValue } from "../component";
import { mountComponent } from "../component/util/mount-component";
import { wrapComponent } from "../component/wrap-component";
import { getDocument } from "../dom/get-document";
import { DOCUMENT_DATA_KEY } from "../dom/get-document.server";
import { PATH_DATA_KEY, PATH_SEIDR_ID } from "../router/constants";
import { clearPathCache } from "../router/get-current-path";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { SeidrError } from "../types";
import { isStr } from "../util/type-guards/index";
import { SSRScope, setSSRScope } from "./ssr-scope";
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
 * @template {ComponentReturnValue} C - The return value of the component function
 *
 * @param {() => C} factory - Component function to render
 * @param {RenderToStringOptions} [options] - Optional options object
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString<C extends ComponentReturnValue>(
  factory: () => C,
  options: RenderToStringOptions = {},
): Promise<SSRRenderResult> {
  const prevSSR = process.env.SEIDR_TEST_SSR;
  process.env.SEIDR_TEST_SSR = "true";

  try {
    return await runWithAppState(async () => {
      const state = getAppState();
      if (!state) {
        throw new SeidrError("No AppState available.");
      }

      if (isStr(options.path)) {
        state.setData(PATH_DATA_KEY, new Seidr<string>(options.path, { ...NO_HYDRATE, id: PATH_SEIDR_ID }));
      }

      const activeScope = options.scope || new SSRScope();
      setSSRScope(activeScope);

      try {
        let comp = wrapComponent(factory)();
        const doc = getDocument().createElement("div");
        const anchor = getDocument().createComment("ssr-anchor");
        doc.appendChild(anchor);

        // First pass: trigger all promises
        mountComponent(comp, anchor);
        await activeScope.waitForPromises();

        // If we encountered promises, the tree structure might have changed (e.g. Pending -> Resolved)
        // Leading to ID drift. We now re-render from a clean state but keep the cached data.
        if (activeScope.callIndex > 0 || activeScope.hasAwaited) {
          comp.unmount();
          anchor.remove();

          state.deleteData(DOCUMENT_DATA_KEY);
          state.markers.clear();
          clearPathCache();

          // Reset AppState component and Seidr ID counters
          setAppStateID(state.ctxID);

          // Restore necessary state and scope
          if (isStr(options.path)) {
            state.setData(PATH_DATA_KEY, new Seidr<string>(options.path, { ...NO_HYDRATE, id: PATH_SEIDR_ID }));
          }
          setSSRScope(activeScope);

          // Reset scope for stable re-render (keeps inServer cache!)
          activeScope.resetForStableRender();

          // Second pass: clean render with resolved data
          comp = wrapComponent(factory)();
          const doc2 = getDocument().createElement("div");
          const newAnchor = getDocument().createComment("ssr-anchor-stable");
          doc2.appendChild(newAnchor);
          mountComponent(comp, newAnchor);
          await activeScope.waitForPromises();
          newAnchor.remove();

          const finalHtml = doc2.innerHTML;
          const hydrationData = {
            ...activeScope.captureHydrationData(),
            ctxID: state.ctxID,
          };
          comp.unmount();
          clearPathCache();
          return { html: finalHtml, hydrationData };
        } else {
          anchor.remove();
        }

        // Use innerHTML to get the stringified content without the wrapping div
        const html = doc.innerHTML;

        const hydrationData = {
          ...activeScope.captureHydrationData(),
          ctxID: state.ctxID,
        };

        comp.unmount();
        clearPathCache();

        return { html, hydrationData };
      } finally {
        setSSRScope(undefined);
        if (state.markers) {
          state.markers.clear();
        }
        if (!options.scope) {
          activeScope.clear();
        }
      }
    });
  } finally {
    if (prevSSR === undefined) delete process.env.SEIDR_TEST_SSR;
    else process.env.SEIDR_TEST_SSR = prevSSR;
  }
}
