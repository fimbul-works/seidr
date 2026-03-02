import { getRenderContext } from "../../render-context/render-context";
import type { RenderContext } from "../../render-context/types";
import { isClient } from "../../util/environment/client";
import type { SSRScope } from "./ssr-scope";
import { scopes } from "./storage";

/**
 * Sets the active SSR scope for the current render context.
 * Call this before starting a render pass.
 *
 * @param {(SSRScope | undefined)} scope - The scope to activate for the current render context
 */
export function setSSRScope(scope: SSRScope | undefined): void {
  if (isClient()) {
    return;
  }

  let ctx: RenderContext;
  try {
    ctx = getRenderContext();
  } catch {
    if (scope === undefined) {
      return;
    }
    scopes.set(-1, scope);
    return;
  }

  ctx = getRenderContext();
  if (scope === undefined) {
    scopes.delete(ctx.ctxID);
  } else {
    scopes.set(ctx.ctxID, scope);
  }
}
