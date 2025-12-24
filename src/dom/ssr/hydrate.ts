import type { SeidrComponent } from "../component.js";
import type { SeidrElementInterface } from "../element.js";
import { clearHydrationContext, getHydrationContext, setHydrationContext } from "./hydration-context.js";
import type { SSRState } from "./types.js";

/**
 * Hydrates a component with previously captured SSR state.
 *
 * This function:
 * 1. Sets the hydration context with the provided state
 * 2. Executes the component factory function
 * 3. Seidr instances will use hydrated values during creation
 * 4. Destroys the component and returns the element
 * 5. Restores the original hydration context
 *
 * This function has the same signature as renderToString, making them
 * two halves of a whole for SSR hydration.
 *
 * @param componentFactory - Function that returns a Seidr Component
 * @param state - The previously captured SSR state
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
 * const { html, state } = renderToString(AppFactory);
 * sendToClient({ html, state });
 *
 * // Client-side:
 * const { html, state } = receiveFromServer();
 * const container = document.getElementById('app');
 * container.innerHTML = html;
 *
 * // Hydrate with state (same signature as renderToString):
 * const hydratedElement = hydrate(AppFactory, state);
 * container.replaceChild(hydratedElement, container.firstElementChild);
 * ```
 */
export function hydrate<C extends SeidrComponent<any, any>>(
  componentFactory: (...args: any) => C,
  state: SSRState,
): SeidrElementInterface {
  const originalContext = { ...getHydrationContext() };

  try {
    setHydrationContext({ state });
    const component = componentFactory();
    // Return the element without destroying the component
    // The component is live and should remain active for client-side interactivity
    return component.element;
  } finally {
    // Always restore original context
    if (originalContext.state) {
      setHydrationContext(originalContext);
    } else {
      clearHydrationContext();
    }
  }
}
