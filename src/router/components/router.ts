import { withScope } from "../../component/component-stack/with-scope";
import { component } from "../../component/component";
import { useScope } from "../../component/component-stack/use-scope";
import type { Component, ComponentFactoryFunction } from "../../component/types";
import { getLastNode, mountComponent } from "../../component/util";
import { wrapComponent } from "../../component/wrap-component";
import type { Seidr } from "../../seidr";
import { noHydrate } from "../../seidr/constants";
import { wrapSeidr } from "../../seidr/wrap-seidr";
import { isFn } from "../../util/type-guards/primitive-types";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { matchRoute } from "../match-route";
import type { RouteDefinition } from "../types";

/**
 * Router component props.
 */
export interface RouterProps<C extends ComponentFactoryFunction = ComponentFactoryFunction> {
  routes: Array<RouteDefinition> | Seidr<Array<RouteDefinition>>;
  fallback?: C | Seidr<C | undefined>;
}

/**
 * Router component - renders the first matching route or a fallback.
 */
export const Router = <C extends ComponentFactoryFunction = ComponentFactoryFunction>(
  routes: Array<RouteDefinition> | Seidr<Array<RouteDefinition>>,
  fallback?: C | Seidr<C | undefined>,
): Component =>
  component(({ routes: routesProp, fallback: fallbackProp }: RouterProps<C>) => {
    const routerScope = useScope()!;

    const routes = wrapSeidr(routesProp, noHydrate);
    const fallback = wrapSeidr(fallbackProp, noHydrate);

    const currentPath = getCurrentPath();
    const currentParams = getCurrentParams();

    let currentRouteIndex = -100;
    let currentComponent: Component | undefined;
    let currentFactory: ComponentFactoryFunction | undefined;

    const path = () => currentPath.value ?? "/";

    const matchCurrentPath = (): { index: number; params: Record<string, string> | null } => {
      const match = matchRoute(path(), routes.value);
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

    const getMatchedFactory = (index: number) => {
      return index > -1 ? routes.value[index][1] : isFn(fallback.value) ? fallback.value : undefined;
    };

    const updateComponent = (index: number) => {
      currentFactory = getMatchedFactory(index);
      if (currentFactory) {
        currentComponent = wrapComponent(currentFactory, "Route")(undefined, path());
      } else {
        currentComponent = undefined;
      }
    };

    const { index: initialIndex, params: initialParams } = matchCurrentPath();

    if (initialIndex > -1 && initialParams) {
      updateRouteTarget(initialIndex, initialParams);
    }
    updateComponent(currentRouteIndex);

    if (currentComponent) {
      routerScope.addChild(currentComponent);
      if (routerScope.parentNode) {
        mountComponent(currentComponent, routerScope.endMarker || null, routerScope.parentNode);
      }
    }

    const updateRoutes = () => {
      const { index: matchedIndex, params: matchedParams } = matchCurrentPath();
      const matchedFactory = getMatchedFactory(matchedIndex);

      // If route hasn't changed, only update params and skip re-render
      if (matchedFactory === currentFactory) {
        updateRouteTarget(matchedIndex, matchedParams);
        return;
      }

      // 1. Resolve anchor point before unmounting
      const lastNode = currentComponent ? getLastNode(currentComponent) : null;
      const anchor = lastNode?.nextSibling || routerScope.endMarker || null;
      const parent = lastNode?.parentNode || routerScope.endMarker?.parentNode || routerScope.parentNode;

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
        routerScope.addChild(currentComponent);
        routerScope.element = currentComponent; // Triggers robust sync
        mountComponent(currentComponent, anchor, parent!);
      } else {
        routerScope.element = undefined;
      }
    };

    routerScope.onUnmount(currentPath.observe(() => withScope(routerScope, updateRoutes)));
    routerScope.onUnmount(routes.observe(() => withScope(routerScope, updateRoutes)));
    routerScope.onUnmount(fallback.observe(() => withScope(routerScope, updateRoutes)));
    routerScope.onUnmount(() => currentComponent?.unmount());

    routerScope.element = currentComponent;
    return currentComponent;
  }, "Router")({ routes, fallback });
