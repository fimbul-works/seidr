import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { clearBetween, getMarkerComments } from "../dom-utils";
import type { SeidrNode } from "../element";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isArr, isDOMNode } from "../util/type-guards";
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
 */
export const Router = component(({ routes, fallback }: RouterProps, id: string) => {
  const scope = useScope();
  const markers = getMarkerComments(id);
  const currentPath = getCurrentPath();

  let currentRouteIndex = -100;
  let currentComponent: SeidrComponent | null = null;
  let currentParamsSeidr: Seidr<Record<string, string>> | null = null;

  const updateRoutes = () => {
    const end = markers[1];
    const parent = end.parentNode;
    if (!parent) return;

    const path = currentPath.value;
    const match = matchRoute(path, routes);

    let matchedIndex = -1;
    let params: Record<string, string> | false = false;

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

    // Full swap
    if (currentComponent) {
      currentComponent.unmount();
      currentComponent = null;
    } else {
      // First render: clear any existing SSR artifacts between markers
      clearBetween(markers[0], markers[1]);
    }

    currentRouteIndex = matchedIndex;

    if (matchedIndex === -1) {
      if (fallback) {
        currentParamsSeidr = null;
        const factory = typeof fallback === "function" ? fallback : () => fallback;
        currentComponent = wrapComponent(factory)();
        mountComponent(currentComponent, end);
      }
    } else {
      currentParamsSeidr = new Seidr(params as Record<string, string>, { ...NO_HYDRATE, id: "router-params" });
      const factory = routes[matchedIndex].componentFactory;
      currentComponent = wrapComponent(factory)(currentParamsSeidr);
      mountComponent(currentComponent, end);
    }
  };

  const mountComponent = (comp: SeidrComponent, anchor: Node) => {
    const parent = anchor.parentNode;
    if (!parent) return;

    if (comp.start) parent.insertBefore(comp.start, anchor);

    const el = comp.element;
    if (isArr(el)) {
      el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, anchor));
    } else if (isDOMNode(el)) {
      parent.insertBefore(el, anchor);
    }

    if (comp.end) parent.insertBefore(comp.end, anchor);

    comp.scope.attached(parent);
  };

  // Re-run matching whenever path changes
  scope.track(currentPath.observe(updateRoutes));

  // Cleanup active component
  scope.track(() => {
    if (currentComponent) {
      currentComponent.unmount();
    }
  });

  // Ensure initial render when attached
  scope.onAttached = () => {
    updateRoutes();
  };

  return [];
}, "router");
