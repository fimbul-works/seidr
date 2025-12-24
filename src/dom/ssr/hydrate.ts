import type { SeidrElementInterface } from "../element.js";
import { clearHydrationContext, getHydrationContext, setHydrationContext } from "./hydration-context.js";
import type { SSRState } from "./types.js";

/**
 * Hydrates a component with previously captured SSR state.
 *
 * This function:
 * 1. Sets the hydration context with the provided state
 * 2. Executes the component function
 * 3. Seidr instances will use hydrated values during creation
 * 4. Restores the original hydration context
 *
 * @param component - Function that returns the root HTMLElement
 * @param state - The previously captured SSR state
 *
 * @returns The hydrated HTMLElement
 *
 * @example
 * ```typescript
 * // Server-side:
 * const { html, state } = renderToString(App);
 * sendToClient({ html, state });
 *
 * // Client-side:
 * const { html, state } = receiveFromServer();
 * const container = document.getElementById('app');
 * container.innerHTML = html;
 *
 * // Hydrate with state:
 * const hydratedElement = hydrate(App, state);
 * container.replaceChild(hydratedElement, container.firstElementChild);
 * ```
 */
export function hydrate(component: () => SeidrElementInterface, state: SSRState): SeidrElementInterface {
  const originalContext = { ...getHydrationContext() };

  try {
    setHydrationContext({ state });
    return component();
  } finally {
    // Always restore original context
    if (originalContext.state) {
      setHydrationContext(originalContext);
    } else {
      clearHydrationContext();
    }
  }
}
