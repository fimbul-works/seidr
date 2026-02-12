import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { mountComponent } from "../component/util";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import { Seidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { isFn } from "../util";
import type { RouteDefinition } from "./create-route";
import { getCurrentPath } from "./get-current-path";
import { matchRoute } from "./match-route";

const ROUTER_PARAMS_ID = "router-params";

/**
 * Router component props.
 */
export interface RouterProps<C extends SeidrComponentFactoryFunction = SeidrComponentFactoryFunction> {
  routes: Array<RouteDefinition>;
  fallback?: C;
}

/**
 * Router component - renders the first matching route or a fallback.
 */
export const Router = <C extends SeidrComponentFactoryFunction = SeidrComponentFactoryFunction>(
  routes: Array<RouteDefinition>,
  fallback?: C,
): SeidrComponent =>
  component(({ routes, fallback }: RouterProps) => {
    const scope = useScope();
    const [, endMarker] = getMarkerComments(scope.id);
    const currentPath = getCurrentPath();

    let currentRouteIndex = -100;
    let currentParamsSeidr: Seidr<Record<string, string>> | undefined;
    let currentComponent: SeidrComponent | undefined;

    const matchCurrentPath = (): { index: number; params: Record<string, string> | null } => {
      const match = matchRoute(currentPath.value, routes);
      return match
        ? {
            index: match.index,
            params: match.params,
          }
        : { index: -1, params: null };
    };

    const updateRouteTarget = (index: number, params: Record<string, string> | null) => {
      currentRouteIndex = index;
      if (currentRouteIndex === -1 || !params) {
        currentParamsSeidr = undefined;
      } else if (currentParamsSeidr) {
        currentParamsSeidr.value = params;
      } else {
        currentParamsSeidr = new Seidr(params, { ...NO_HYDRATE, id: ROUTER_PARAMS_ID });
      }
    };

    const updateComponent = (index: number) => {
      currentComponent =
        index > -1
          ? wrapComponent(routes[index][1])(currentParamsSeidr!)
          : isFn(fallback)
            ? wrapComponent(fallback)()
            : undefined;
    };

    const { index: initialIndex, params: initialParams } = matchCurrentPath();

    if (initialIndex > -1 && initialParams) {
      updateRouteTarget(initialIndex, initialParams);
    }
    updateComponent(currentRouteIndex);

    const updateRoutes = () => {
      const { index: matchedIndex, params: matchedParams } = matchCurrentPath();

      // If route hasn't changed, only update params and skip re-render
      if (matchedIndex === currentRouteIndex) {
        updateRouteTarget(matchedIndex, matchedParams);
        return;
      }

      // Full swap
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      // Update index and parameters
      currentRouteIndex = matchedIndex;
      updateRouteTarget(matchedIndex, matchedParams);
      updateComponent(matchedIndex);

      if (currentComponent) {
        mountComponent(currentComponent, endMarker);
      }
    };

    scope.observe(currentPath, updateRoutes);
    scope.track(() => currentComponent?.unmount());

    return currentComponent;
  }, "Router")({ routes, fallback });
