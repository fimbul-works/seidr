import { getAppState } from "../app-state/app-state.js";
import { runWithAppState } from "../app-state/app-state.ssr.js";
import type { ComponentFactoryFunction } from "../component/types.js";
import { mountComponent } from "../component/util/mount-component.js";
import { wrapComponent } from "../component/wrap-component.js";
import { getDocument } from "../dom/get-document.js";
import { initSSRDocument } from "../dom/get-document.ssr.js";
import { SSRScope, setSSRScope } from "./ssr-scope.js";
import type { SSRRenderResult } from "./types.js";

/**
 * Renders a component to an HTML string with hydration data capture.
 *
 * @template {ComponentReturnValue} C - The return value of the component function
 *
 * @param {() => C} factory - Component function to render
 * @param {AppStateData | SSRInitFn} [dataOrInit={}] - Optional data object or initialization callback
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString(factory: ComponentFactoryFunction): Promise<SSRRenderResult> {
  // Keep track of previous SSR state for tests
  let prevSSR: string | undefined;
  if (process.env.VITEST) {
    prevSSR = process.env.VITEST && process.env.SEIDR_TEST_SSR;
    process.env.SEIDR_TEST_SSR = "true";
  }

  try {
    return await runWithAppState(async () => {
      const appState = getAppState();
      initSSRDocument();

      const activeScope = new SSRScope(appState);
      setSSRScope(activeScope);

      try {
        const comp = wrapComponent(factory, "Root")();
        const doc = getDocument().createElement("div");
        const anchor = getDocument().createComment("ssr-anchor");
        doc.appendChild(anchor);

        mountComponent(comp, anchor);
        anchor.remove();

        // Trigger all promises
        await activeScope.waitForPromises();

        // Use innerHTML to get the stringified content without the wrapping div
        const html = doc.innerHTML;
        const hydrationData = activeScope.captureHydrationData();

        comp.unmount();
        appState.destroy();
        activeScope.clear();

        return { html, hydrationData };
      } finally {
        setSSRScope(undefined);
      }
    });
  } finally {
    // Restore previous SSR state for tests
    if (process.env.VITEST) {
      if (prevSSR === undefined) {
        delete process.env.SEIDR_TEST_SSR;
      } else {
        process.env.SEIDR_TEST_SSR = prevSSR;
      }
    }
  }
}
