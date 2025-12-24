import type { Seidr } from "../../seidr";
import type { SSRScope } from "./ssr-scope";

/**
 * Stack of active SSR scopes.
 * Supports nested component rendering with proper scope management.
 */
const renderStack: SSRScope[] = [];

/**
 * Pushes an SSR scope onto the render stack.
 * Call this before starting a render pass.
 *
 * @param scope - The scope to push
 */
export function pushSSRScope(scope: SSRScope): void {
  renderStack.push(scope);
}

/**
 * Pops the current SSR scope from the render stack.
 * Call this after completing a render pass.
 */
export function popSSRScope(): void {
  renderStack.pop();

  // Clear global registration if no more scopes
  if (renderStack.length === 0) {
    globalThis.__seidr_ssr_register = undefined;
  }
}

/**
 * Gets the currently active SSR scope (top of stack).
 * Returns undefined if not in SSR mode or no scope is active.
 *
 * @returns The active SSR scope or undefined
 */
export function getActiveSSRScope(): SSRScope | undefined {
  return renderStack[renderStack.length - 1];
}

/**
 * Checks if we're currently in an SSR render pass.
 *
 * @returns true if in SSR mode with an active scope
 */
export function isInSSRMode(): boolean {
  return renderStack.length > 0;
}
