/**
 * Navigation options passed to navigation handlers and navigate().
 */
export interface NavigationOptions {
  /** Whether to replace the current history entry */
  replace?: boolean;
  /** Custom state to associate with the navigation */
  state?: unknown;
}

/**
 * A target for navigation, which can be a URL string, a URL instance, or a numeric history delta.
 */
export type NavigationTarget = string | number | URL;

/**
 * Function signature for navigation handlers.
 * Return `true` if the navigation was handled, or `false`/`void` to pass to subsequent handlers.
 */
export type NavigationHandler = (
  target: NavigationTarget,
  options?: NavigationOptions,
) => boolean | void;
