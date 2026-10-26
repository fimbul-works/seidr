import type { DerivedValue } from "@fimbul-works/seidr";
import { browserRouter } from "../browser-router.js";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";

/**
 * Returns the current search parameters as a derived Value and a setter function.
 *
 * @returns {[DerivedValue<Record<string, string>>, (name: string, value: string) => void]} Tuple of [params, setParam]
 */
export const useSearchParams = (): [DerivedValue<Record<string, string>>, (name: string, value: string) => void] => {
  initRouter();

  const routerState = getRouterState();
  const router = browserRouter();

  const setParam = (name: string, value: string) => {
    const url = new URL(routerState.url().href);
    url.searchParams.set(name, value);
    router.push(url.pathname + url.search + url.hash);
  };

  return [router.searchParams.as((params: Record<string, string>) => params), setParam];
};
