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
    const routerComponent = useScope()!;
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
        currentComponent = wrapComponent(currentFactory, "Route")(undefined, routerComponent, path());
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
      routerComponent.addChild(currentComponent);
      if (routerComponent.parentNode) {
        mountComponent(currentComponent, routerComponent.endMarker || null, routerComponent.parentNode);
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
      const anchor = lastNode?.nextSibling || routerComponent.endMarker || null;
      const parent = lastNode?.parentNode || routerComponent.endMarker?.parentNode || routerComponent.parentNode;

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
        routerComponent.addChild(currentComponent);
        routerComponent.element = currentComponent; // Triggers robust sync
        mountComponent(currentComponent, anchor, parent!);
      } else {
        routerComponent.element = undefined;
      }
    };

    routerComponent.onUnmount(currentPath.observe(updateRoutes));
    routerComponent.onUnmount(routes.observe(updateRoutes));
    routerComponent.onUnmount(fallback.observe(updateRoutes));
    routerComponent.onUnmount(() => currentComponent?.unmount());

    routerComponent.element = currentComponent;
    return currentComponent;
  }, "Router")({ routes, fallback });
