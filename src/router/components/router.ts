import { component } from "../../component/component";
import { getMarkerComments } from "../../component/get-marker-comments";
import type { Component, ComponentFactoryFunction } from "../../component/types";
import { useScope } from "../../component/use-scope";
import { getLastNode, mountComponent } from "../../component/util";
import { wrapComponent } from "../../component/wrap-component";
import { isFn } from "../../util/type-guards/primitive-types";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { matchRoute } from "../match-route";
import type { RouteDefinition } from "../types";

/**
 * Router component props.
 */
export interface RouterProps<C extends ComponentFactoryFunction = ComponentFactoryFunction> {
  routes: Array<RouteDefinition>;
  fallback?: C;
}

/**
 * Router component - renders the first matching route or a fallback.
 */
export const Router = (routes: Array<RouteDefinition>, fallback?: ComponentFactoryFunction): Component =>
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
        index > -1 ? wrapComponent(routes[index][1])() : isFn(fallback) ? wrapComponent(fallback)() : undefined;
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

      // 1. Resolve anchor point before unmounting
      const lastNode = currentComponent ? getLastNode(currentComponent) : null;
      const anchor = lastNode?.nextSibling || endMarker;
      const parent = lastNode?.parentNode || endMarker?.parentNode || scope.parentNode;

      // 2. Full swap
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      // Update index and parameters
      currentRouteIndex = matchedIndex;
      updateRouteTarget(matchedIndex, matchedParams);
      updateComponent(matchedIndex);

      if (currentComponent) {
        scope.child(currentComponent);
        mountComponent(currentComponent, anchor, parent!);
      }
    };

    scope.observe(currentPath, updateRoutes);
    scope.onUnmount(() => currentComponent?.unmount());

    return currentComponent;
  }, "Router")({ routes, fallback });
