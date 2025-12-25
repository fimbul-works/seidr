import { restoreRenderContextState } from "../../state.js";
import type { SeidrComponent } from "../component.js";
import { mount } from "../mount/mount.js";
import { resetClientRenderContext, setClientRenderContext } from "../render-context.js";
import { clearHydrationContext, getHydrationContext, setHydrationContext } from "./hydration-context.js";
import type { HydrationData } from "./types.js";

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
 * @param componentFactory - Function that returns a Seidr Component
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
 * const AppFactory = () => component((scope) => {
 *   const count = new Seidr(42);
 *   return $('div', {}, [`Count: ${count.value}`]);
 * });
 *
 * const { html, hydrationData } = await runWithRenderContext(async () => {
 *   return await renderToString(AppFactory);
 * });
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
export function hydrate<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  container: HTMLElement,
  hydrationData: HydrationData,
): SeidrComponent {
  const originalHydrationContext = getHydrationContext();

  try {
    // Set the client render context so State lookups use the correct context ID
    setClientRenderContext(hydrationData.renderContextID);

    // Restore State values from the server
    if (hydrationData.state) {
      restoreRenderContextState(hydrationData.renderContextID, hydrationData.state);
    }

    // Set the hydration context so Seidr instances get their server values
    setHydrationContext(hydrationData);

    // Create the component (Seidr instances will auto-hydrate)
    const component = componentFactory();

    // Mount the component in the container
    mount(component, container);

    // Clean up old SSR elements marked for removal
    container.querySelectorAll('[data-seidr-remove="1"]').forEach((el) => el.remove());
    return component;
  } finally {
    // Always restore original contexts
    resetClientRenderContext();

    if (originalHydrationContext) {
      setHydrationContext(originalHydrationContext);
    } else {
      clearHydrationContext();
    }
  }
}
