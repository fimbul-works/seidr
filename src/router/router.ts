import { component } from "../component/component";
import type { SeidrComponent } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { clearBetween } from "../dom/clear-between";
import { getMarkerComments } from "../dom/get-marker-comments";
import type { SeidrNode } from "../element";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isArray, isDOMNode } from "../util/type-guards";
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
export const Router = component(({ routes, fallback }: RouterProps) => {
  const scope = useScope();
  const [start, end] = getMarkerComments(scope.id);
  const currentPath = getCurrentPath();

  let currentRouteIndex = -100;
  let currentComponent: SeidrComponent | null = null;
  let currentParamsSeidr: Seidr<Record<string, string>> | null = null;

  const updateRoutes = () => {
    const parent = end.parentNode;
    if (!parent) {
      return;
    }

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
      if (currentParamsSeidr) {
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
      clearBetween(start, end);
    }

    currentRouteIndex = matchedIndex;

    if (matchedIndex !== -1) {
      currentParamsSeidr = new Seidr(params as Record<string, string>, { ...NO_HYDRATE, id: "router-params" });
      currentComponent = wrapComponent(routes[matchedIndex].componentFactory)(currentParamsSeidr);
      mountComponent(currentComponent, end);
    } else if (fallback) {
      currentParamsSeidr = null;
      currentComponent = wrapComponent(typeof fallback === "function" ? fallback : () => fallback)();
      mountComponent(currentComponent, end);
    }
  };

  const mountComponent = (comp: SeidrComponent, anchor: Node) => {
    const parent = anchor.parentNode;
    if (!parent) {
      return;
    }

    const { startMarker: startNode, endMarker: endNode, element: el } = comp;

    if (startNode) {
      parent.insertBefore(startNode, anchor);
    }

    if (isArray(el)) {
      el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, anchor));
    } else if (isDOMNode(el)) {
      parent.insertBefore(el, anchor);
    }

    if (endNode) {
      parent.insertBefore(endNode, anchor);
    }

    comp.scope.attached(parent);
  };

  scope.track(currentPath.observe(updateRoutes));
  scope.track(() => currentComponent?.unmount());

  scope.onAttached = () => updateRoutes();

  return [];
}, "Router");
