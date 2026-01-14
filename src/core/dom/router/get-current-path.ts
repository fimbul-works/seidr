import { getRenderContext } from "../../render-context-contract";
import { Seidr } from "../../seidr";

/** Map to cache Seidr instances per render context ID */
const pathCache = new Map<number, Seidr<string>>();

/** Client-side path state (created once, reused across calls) */
let clientPathState: Seidr<string> | undefined;

/** Clear cached path for a render context */
export function clearPathCache(renderContextID: number): void {
  pathCache.delete(renderContextID);
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
  if (ctx) {
    let pathSeidr = pathCache.get(ctx.renderContextID);

    if (!pathSeidr) {
      // Create a new Seidr for this render context
      pathSeidr = new Seidr(ctx.currentPath);
      pathCache.set(ctx.renderContextID, pathSeidr);
    } else {
      // Update the cached Seidr with the current path from context
      // This allows renderToString to set different paths for different renders
      pathSeidr.value = ctx.currentPath;
    }

    return pathSeidr;
  }

  // Client-side: Use module-level state
  if (!clientPathState) {
    clientPathState = new Seidr((typeof window !== "undefined" ? window.location.pathname : "/") || "/");
  }
  return clientPathState;
}
