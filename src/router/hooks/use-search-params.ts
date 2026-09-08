import type { Value } from "../../observable/value.js";
import { browserRouter } from "../browser-router.js";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";

/**
 * Returns the current search parameters as a derived Value and a setter function.
 *
 * @returns {[Value<Record<string, string>>, (name: string, value: string) => void]} Tuple of [params, setParam]
 */
export const useSearchParams = (): [Value<Record<string, string>>, (name: string, value: string) => void] => {
  initRouter();

  const routerState = getRouterState();
  const node = getNearestRouter();
  const router = node ? node.router : browserRouter();

  const setParam = (name: string, value: string) => {
    const url = new URL(routerState.url().href);
    url.searchParams.set(name, value);
    router.push(url.pathname + url.search + url.hash);
  };

  return [router.searchParams.as((params) => params), setParam];
};
