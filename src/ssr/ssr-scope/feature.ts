import type { SSRScope } from "./ssr-scope";

/**
 * SSR scopes indexed by render context ID.
 * This ensures concurrent SSR requests have isolated scopes.
 */
export const scopes = new Map<number, SSRScope>();
