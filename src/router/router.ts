import { component } from "../component/component";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { mountComponent } from "../component/util";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import { isFn } from "../util";
import { getCurrentParams } from "./get-current-params";
import { getCurrentPath } from "./get-current-path";
import { matchRoute } from "./match-route";
import type { RouteDefinition } from "./types";

/**
 * Router component props.
 */
export interface RouterProps<C extends ComponentFactoryFunction<any> = ComponentFactoryFunction<any>> {
  routes: Array<RouteDefinition>;
  fallback?: C;
}

/**
 * Router component - renders the first matching route or a fallback.
 */
export const Router = <C extends ComponentFactoryFunction<any> = ComponentFactoryFunction<any>>(
  routes: Array<RouteDefinition>,
  fallback?: C,
): Component =>
  component(({ routes, fallback }: RouterProps) => {
    const scope = useScope();

    const [, endMarker] = getMarkerComments(scope.id);
    const currentPath = getCurrentPath();
    const currentParams = getCurrentParams();

    let currentRouteIndex = -100;
    let currentComponent: Component | undefined;

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
      if (params) {
        currentParams.value = params;
      } else {
        currentParams.value = {};
      }
    };

    const updateComponent = (index: number) => {
      currentComponent =
        index > -1
          ? wrapComponent(routes[index][1])(currentParams)
          : isFn(fallback)
            ? wrapComponent(fallback)(currentParams)
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
