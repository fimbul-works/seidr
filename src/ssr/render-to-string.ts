import type { ComponentReturnValue } from "../component";
import { mountComponent } from "../component/util/mount-component";
import { wrapComponent } from "../component/wrap-component";
import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
import { getAppState } from "../render-context/render-context";
import { runWithAppState } from "../render-context/render-context.node";
import { PATH_DATA_KEY, PATH_SEIDR_ID } from "../router/constants";
import { clearPathCache } from "../router/get-current-path";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
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
  return await runWithAppState(async () => {
    const prevFactory = getDocument;
    setInternalGetDocument(getSSRDocument);

    try {
      const state = getAppState();
      if (!state) {
        throw new SeidrError("No AppState available.");
      }

      let pathSeidr: Seidr<string> | undefined;
      if (isStr(options.path)) {
        pathSeidr = new Seidr<string>(options.path, { ...NO_HYDRATE, id: PATH_SEIDR_ID });
        state.setData(PATH_DATA_KEY, pathSeidr);
      }

      const activeScope = options.scope ?? new SSRScope();
      setSSRScope(activeScope);

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
          ctxID: state.ctxID,
        };

        comp.unmount();
        pathSeidr?.destroy();
        clearPathCache();

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
