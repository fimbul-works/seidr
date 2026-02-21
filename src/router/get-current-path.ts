import { getCurrentComponent } from "../component/component-stack";
import { getRenderContext } from "../render-context/render-context";
import { NO_HYDRATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { isServer } from "../util/environment/server";

const PATH_SEIDR_ID = "router-path";

/** Map to cache Seidr instances per render context ID */
const pathCache = new Map<number, Seidr<string>>();

/** Client-side path state (created once, reused across calls) */
let clientPathState: Seidr<string> | undefined;

/** Clear cached path for a render context */
export const clearPathCache = (ctxID: number) => pathCache.delete(ctxID);

/** Reset client-side path state (for testing) */
export const resetClientPathState = () => (clientPathState = undefined);

/**
 * Get the reactive current path observable.
 *
 * On the client: Returns a module-level Seidr that persists across the session.
 * On the server: Returns a cached Seidr per render context (request-isolated).
 *
 * @returns {Seidr<string>} Reactive current path observable
 */
export const getCurrentPath = (): Seidr<string> => {
  // Server-side: Get or create Seidr for this render context
  if (isServer()) {
    const ctx = getRenderContext();
    const ctxID = ctx.ctxID;

    let observable = pathCache.get(ctxID);

    if (!observable) {
      // Create a new Seidr for this render context
      observable = new Seidr<string>(ctx.currentPath, { ...NO_HYDRATE, id: PATH_SEIDR_ID });
      pathCache.set(ctxID, observable);

      // Keep context synchronized with observable changes
      // This is important for SSR navigation and hydration tests
      observable.observe((val) => (ctx.currentPath = val.toString()));
    } else {
      // Update the cached Seidr with the current path from context
      // This allows renderToString to set different paths for different renders
      observable.value = ctx.currentPath;
    }

    return observable;
  }

  // Client-side: Use module-level state
  if (!clientPathState) {
    clientPathState = new Seidr(window.location?.pathname ?? "/", {
      ...NO_HYDRATE,
      id: PATH_SEIDR_ID,
    });

    // Handle history.back
    const component = getCurrentComponent();
    if (component) {
      const popStateHandler = () => (clientPathState!.value = window.location.toString());
      window.addEventListener("popstate", popStateHandler);
      component.scope.track(() => window.removeEventListener("popstate", popStateHandler));
    }
  }

  return clientPathState;
};
