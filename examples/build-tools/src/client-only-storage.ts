import { isClient } from "@fimbul-works/seidr";

/**
 * Client-only storage module accessing browser localStorage.
 * This file and its identifiers MUST NEVER appear in any server/SSR bundle.
 */
export function getClientLocalStorageItem(key: string): string | null {
  if (isClient()) {
    return window.localStorage.getItem(key);
  }
  return null;
}
