import type { SeidrComponent } from "../component.js";
import type { SeidrElement, SeidrElementInterface } from "../element.js";
import { clearHydrationContext, getHydrationContext, setHydrationContext } from "./hydration-context.js";
import type { HydrationData } from "./types.js";

/**
 * Hydrates a component with previously captured SSR hydration data.
 *
 * This function:
 * 1. Sets the hydration context with the provided hydration data
 * 2. Executes the component factory function
 * 3. Seidr instances will use hydrated values during creation
 * 4. Returns the live element without destroying the component
 * 5. Restores the original hydration context
 *
 * This function has the same signature as renderToString, making them
 * two halves of a whole for SSR hydration.
 *
 * @param componentFactory - Function that returns a Seidr Component
 * @param hydrationData - The previously captured hydration data
 *
 * @returns The hydrated HTMLElement from the component
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
 * const { html, hydrationData } = renderToString(AppFactory);
 * sendToClient({ html, hydrationData });
 *
 * // Client-side:
 * const { html, hydrationData } = receiveFromServer();
 * const container = document.getElementById('app');
 * container.innerHTML = html;
 *
 * // Hydrate with hydrationData (same signature as renderToString):
 * const hydratedElement = hydrate(AppFactory, hydrationData);
 * container.replaceChild(hydratedElement, container.firstElementChild);
 * ```
 */
export function hydrate<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  hydrationData: HydrationData,
): SeidrElement {
  const originalContext = getHydrationContext();

  try {
    setHydrationContext(hydrationData);
    const component = componentFactory();
    // Return the element without destroying the component
    // The component is live and should remain active for client-side interactivity
    return component.element;
  } finally {
    // Always restore original context
    if (originalContext) {
      setHydrationContext(originalContext);
    } else {
      clearHydrationContext();
    }
  }
}
