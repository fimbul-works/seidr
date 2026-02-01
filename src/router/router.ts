import { component } from "../component/component";
import { type SeidrComponent, useScope, wrapComponent } from "../component/index";
import { getDOMFactory } from "../dom-factory/index";
import { $fragment, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isHydrating, isSSR } from "../util/env";
import { uid } from "../util/uid";
import type { RouteDefinition } from "./create-route";
import { getCurrentPath } from "./get-current-path";
import { matchRoute } from "./match-route";

/**
 * Router component props.
 */
export interface RouterProps {
  routes: Array<RouteDefinition<any, any>>;
  fallback?: SeidrNode | (() => SeidrNode);
}

/**
 * Router component - renders the first matching route or a fallback.
 *
 * Routes are evaluated in order, so more specific routes should be placed
 * before less specific ones (e.g., "/user/:id" before "/user/*").
 *
 * @param {RouterProps} props - Router props containing routes and optional fallback
 * @returns {SeidrComponent<SeidrFragment>} SeidrComponent that manages route rendering
 */
export const Router = component(({ routes, fallback }: RouterProps): SeidrComponent<SeidrFragment> => {
  const scope = useScope();
  const ctx = getRenderContext();

  // Use a unique ID for this router instance
  // During SSR, we use a counter to ensure deterministic IDs for hydration
  const instanceId = ctx ? ctx.idCounter++ : uid();
  const routerId = ctx ? `router-${ctx.ctxID}-${instanceId}` : uid();

  // Detect SSR mode
  const isSSRMode = isSSR();

  // Fragment used to delimit the router's content in the DOM
  let fragment: SeidrFragment;

  if (isSSRMode) {
    fragment = $fragment([], routerId);
  } else if (isHydrating()) {
    const [s, e] = findMarkers(routerId);
    fragment = $fragment([], routerId, s || undefined, e || undefined);
  } else {
    fragment = $fragment([], routerId);
  }

  const currentPath = getCurrentPath();

  let currentRouteIndex = -100; // Initialize to a value that won't match any index or fallback
  let currentComponent: SeidrComponent | null = null;
  let currentParamsSeidr: Seidr<Record<string, string>> | null = null;

  /**
   * Clears all nodes within the router fragment.
   */
  const clearContent = () => {
    fragment.clear();
  };

  /**
   * Matches the current path against defined routes and updates the rendered component.
   */
  const updateRoutes = () => {
    const path = currentPath.value;
    let matchedIndex = -1;
    let params: Record<string, string> | false = false;

    // 1. Find matching route
    const match = matchRoute(path, routes);

    if (match) {
      matchedIndex = match.index;
      params = match.params;
    }

    const routeChanged = matchedIndex !== currentRouteIndex;

    // If route hasn't changed, only update params and skip re-render
    if (!routeChanged) {
      if (currentParamsSeidr && params) {
        currentParamsSeidr.value = params as Record<string, string>;
      }
      return;
    }

    // 2. Handle component updates (Full swap)
    currentComponent?.element.remove();
    clearContent();

    currentRouteIndex = matchedIndex;

    if (matchedIndex === -1) {
      // Show Fallback
      currentParamsSeidr = null;
      if (fallback) {
        const factory = typeof fallback === "function" ? fallback : () => fallback;
        currentComponent = wrapComponent(factory)();
        mountComponent(currentComponent);
      }
    } else {
      // Show matched route
      currentParamsSeidr = new Seidr(params as Record<string, string>, { ...NO_HYDRATE, id: "router-params" });
      const factory = routes[matchedIndex].componentFactory;
      currentComponent = wrapComponent(factory)(currentParamsSeidr);
      mountComponent(currentComponent!);
    }
  };

  /**
   * Helper to insert a component's element between the markers.
   */
  const mountComponent = (comp: SeidrComponent) => {
    if (!comp.element) return;
    fragment.appendChild(comp.element as any);
    if (!isSSRMode && fragment.parentNode && comp.scope.onAttached) {
      comp.scope.onAttached(fragment.parentNode);
    }
  };

  // Re-run matching whenever path changes
  scope.track(currentPath.observe(updateRoutes));

  // Cleanup: destroy active component
  scope.track(() => {
    currentComponent?.element.remove();
    currentComponent = null;
    currentParamsSeidr = null;
    fragment.remove();
  });

  // Ensure markers and content are mounted when parent is ready
  scope.onAttached = (parent) => {
    if (!isSSRMode && !fragment.parentNode && parent) {
      fragment.appendTo(parent as any);
    }
    updateRoutes();
  };

  if (isSSRMode) {
    updateRoutes();
  }

  return fragment as any;
});
