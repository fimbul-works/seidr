import { getAppState } from "../../render-context/render-context";
import type { AppState } from "../../render-context/types";
import { isClient } from "../../util/environment/client";
import type { SSRScope } from "./ssr-scope";
import { scopes } from "./storage";

/**
 * Sets the active SSR scope for the current application state.
 * Call this before starting a render pass.
 *
 * @param {(SSRScope | undefined)} scope - The scope to activate for the current application state
 */
export function setSSRScope(scope: SSRScope | undefined): void {
  if (isClient()) {
    return;
  }

  let state: AppState;
  try {
    state = getAppState();
  } catch {
    if (scope === undefined) {
      return;
    }
    scopes.set(-1, scope);
    return;
  }

  if (scope === undefined) {
    scopes.delete(state.ctxID);
  } else {
    scopes.set(state.ctxID, scope);
  }
}
