import { component, mount, type SeidrComponent, type SeidrNode } from "../core/dom";
import { $query } from "../core/dom/query";
import { isSeidrComponentFactory } from "../core/util/is";
import { setRenderContextID as setRenderContextIDBrowser } from "../render-context.browser";
import { clearHydrationData, setHydrationData } from "./hydration-context";
import { restoreGlobalState } from "./state";
import type { HydrationData } from "./types";

// Use browser implementation or no-op for Node
const setRenderContextID = typeof window !== "undefined" ? setRenderContextIDBrowser : () => {};

export let isHydrating: boolean = false;

/**
 * Resets the isHydrating flag (for testing).
 * @internal
 */
export function resetHydratingFlag() {
  isHydrating = false;
}

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * This function:
 * 1. Sets the client render context with the ID from hydrationData
 * 2. Sets the hydration context with the provided hydration data
 * 3. Executes the component factory function
 * 4. Seidr instances will use hydrated values during creation
 * 5. Mounts the component in the container
 * 6. Returns the live component without destroying it
 * 7. Restores the original contexts
 *
 * This function has the same signature as renderToString, making them
 * two halves of a whole for SSR hydration.
 *
 * @param factory - Function that returns a Seidr Component
 * @param container - The HTMLElement to mount the hydrated component into
 * @param hydrationData - The previously captured hydration data with renderContextID
 *
 * @returns The hydrated SeidrComponent
 *
 * @example
 * ```typescript
 * import { component, $ } from '@fimbul-works/seidr';
 * import { renderToString, hydrate } from '@fimbul-works/seidr/ssr';
 *
 * // Server-side:
 * const AppFactory = component((scope) => {
 *   const count = new Seidr(42);
 *   return $('div', {}, [`Count: ${count.value}`]);
 * });
 *
 * const { html, hydrationData } = await await renderToString(AppFactory);
 * sendToClient({ html, hydrationData });
 *
 * // Client-side:
 * const { html, hydrationData } = receiveFromServer();
 * const container = document.getElementById('app');
 * container.innerHTML = html;
 *
 * // Hydrate with hydrationData (same signature as renderToString):
 * hydrate(AppFactory, container, hydrationData);
 * // The app is now interactive!
 * ```
 */
export function hydrate<T extends SeidrNode>(
  factory: (...args: any) => T,
  container: HTMLElement,
  hydrationData: HydrationData,
): SeidrComponent {
  isHydrating = true;

  // Set the client render context ID from the server to ensure marker matching
  // NOTE: We DON'T reset this in the finally block because it needs to persist
  // for the lifetime of the component. The render context ID should match the
  // server's ID for all reactive updates to work correctly.
  const hasRenderContextID = hydrationData.renderContextID !== undefined;
  if (hasRenderContextID) {
    setRenderContextID(hydrationData.renderContextID!);
  }

  // Restore state values from the server
  if (hydrationData.state) {
    restoreGlobalState(hydrationData.state);
  }

  // Set the hydration context so Seidr instances get their server values
  setHydrationData(hydrationData);

  // Find existing root component after SSR
  const existingRoot = $query(`[data-seidr-root="${hasRenderContextID ? hydrationData.renderContextID : "true"}"]`);

  // Create the component (Seidr instances will auto-hydrate)
  const comp = (isSeidrComponentFactory(factory)
    ? factory()
    : component<void>(factory as any)()) as any as SeidrComponent;

  // Mount the component in the container
  mount(comp, container);

  // Remove existing root component if found
  if (existingRoot) {
    existingRoot.remove();
  }

  // Clear the hydration context
  clearHydrationData();

  return comp;
}
