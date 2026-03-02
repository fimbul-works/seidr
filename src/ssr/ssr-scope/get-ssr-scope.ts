import { getRenderContextID } from "../../render-context/render-context";
import type { SSRScope } from "./ssr-scope";
import { scopes } from "./storage";

/**
 * Gets the SSR scope for the current render context.
 * Returns undefined if not in SSR mode or no scope is active for this context.
 *
 * @returns {(SSRScope | undefined)} The SSR scope for the current render context, or undefined
 */
export function getSSRScope(): SSRScope | undefined {
  return scopes.get(getRenderContextID());
}
