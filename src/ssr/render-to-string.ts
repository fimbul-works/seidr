import { getAppState, setAppStateProvider } from "../app-state/app-state.js";
import { getSSRAppState, runWithAppState } from "../app-state/app-state.ssr.js";
import { isComponent } from "../component/type-guards.js";
import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../component/types.js";
import { wrapComponent } from "../component/wrap-component.js";
import { appendChild } from "../dom/append-child.js";
import { getDocument, setDocumentProvider } from "../dom/get-document.js";
import { initSSRDocument } from "../dom/get-document.ssr.js";
import { SSRScope, setSSRScope } from "./ssr-scope.js";
import type { SSRRenderResult } from "./types.js";

/**
 * Renders a component or factory function to an HTML string with hydration data capture.
 *
 * @param {SeidrComponentFactoryOrFunction} factory - Component or factory function to render
 * @returns {Promise<SSRRenderResult>} Object containing HTML string and hydration data
 */
export async function renderToString(factory: SeidrComponentFactoryOrFunction): Promise<SSRRenderResult> {
  // Keep track of previous SSR state for tests
  let prevSSR: string | undefined;
  if (process.env.VITEST) {
    prevSSR = process.env.VITEST && process.env.SEIDR_TEST_SSR;
    process.env.SEIDR_TEST_SSR = "true";
  }

  const prevAppStateProvider = getAppState;
  const prevDocumentProvider = getDocument;

  // Register SSR state provider
  setAppStateProvider(getSSRAppState);

  try {
    return await runWithAppState(async () => {
      const appState = getAppState();
      initSSRDocument();

      const activeScope = new SSRScope(appState);
      setSSRScope(activeScope);

      try {
        const comp: SeidrComponent = isComponent(factory) ? factory : wrapComponent(factory, "Root")();

        const container = getDocument().createElement("div");
        appendChild(container, comp);

        // Await all promises registered during SSR
        await activeScope.waitForPromises();

        // Use innerHTML to get the stringified content without the wrapping div
        const html = container.innerHTML;
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
    setAppStateProvider(prevAppStateProvider);
    setDocumentProvider(prevDocumentProvider);

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
