import { getRenderContext } from "../render-context/render-context";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isClient } from "../util/environment/browser";
import { isServer } from "../util/environment/server";

const PATH_SEIDR_ID = "router-path";

/** Map to cache Seidr instances per render context ID */
const pathCache = new Map<number, Seidr<string>>();

/** Client-side path state (created once, reused across calls) */
let clientPathState: Seidr<string> | undefined;

/** Clear cached path for a render context */
export function clearPathCache(ctxID: number): void {
  pathCache.delete(ctxID);
}

/** Reset client-side path state (for testing) */
export function resetClientPathState(): void {
  clientPathState = undefined;
}

/**
 * Get the reactive current path observable.
 *
 * On the client: Returns a module-level Seidr that persists across the session.
 * On the server: Returns a cached Seidr per render context (request-isolated).
 *
 * @returns {Seidr<string>} Reactive current path observable
 */
export function getCurrentPath(): Seidr<string> {
  const ctx = getRenderContext();

  // Server-side: Get or create Seidr for this render context
  if (isServer()) {
    let pathSeidr = pathCache.get(ctx.ctxID);

    if (!pathSeidr) {
      // Create a new Seidr for this render context
      pathSeidr = new Seidr(ctx.currentPath, { ...NO_HYDRATE, id: PATH_SEIDR_ID });
      pathCache.set(ctx.ctxID, pathSeidr);

      // Keep context synchronized with observable changes
      // This is important for SSR navigation and hydration tests
      pathSeidr.observe((val) => (ctx.currentPath = val));
    } else {
      // Update the cached Seidr with the current path from context
      // This allows renderToString to set different paths for different renders
      pathSeidr.value = ctx.currentPath;
    }

    return pathSeidr;
  }

  // Client-side: Use module-level state
  if (!clientPathState) {
    clientPathState = new Seidr(isClient() ? window.location?.pathname : "/", {
      ...NO_HYDRATE,
      id: PATH_SEIDR_ID,
    });
  }

  return clientPathState;
}
