import { createComponent } from "../../component/create-component.js";
import { getComponentScope, setComponentScope } from "../../component/lifecycle/component-scope.js";
import { isComponent } from "../../component/type-guards.js";
import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../../component/types.js";
import { getMarkerComments } from "../../component/util/get-marker-comments.js";
import { wrapComponent } from "../../component/wrap-component.js";
import type { Value } from "../../observable/value.js";
import { createValue } from "../../observable/value.js";
import { wrapValue } from "../../observable/wrap-value.js";
import { browserRouter } from "../browser-router.js";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { matchRoute } from "../match-route.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";
import { registerRouter } from "../router-tree/register-router.js";
import type { Route, RouteMatch, RouterInterface } from "../types.js";

/**
 * Router component options.
 */
export interface RouterOptions {
  router?: RouterInterface;
  url?: string | URL;
}

/**
 * Router component - renders the first matching route.
 * Use a wildcard route ("*") as the last entry for fallback behavior.
 *
 * @param {Array<Route> | Value<Array<Route>>} routes - Array of route definitions or a Value that resolves to it
 * @param {RouterOptions} [options={}] - Optional router options. If not provided, browserRouter() will be used.
 * @param {string} [name="Router"] - Optional name for the component (used for debugging)
 * @returns {SeidrComponent} The Router component instance
 */
export const Router = (
  routes: Array<Route> | Value<Array<Route>>,
  options: RouterOptions = {},
  name: string = "Router",
): SeidrComponent =>
  createComponent(() => {
    initRouter(options.url);

    const routerComponent = getComponentScope()!;
    const [startMarker, endMarker] = getMarkerComments(routerComponent)!;
    const routesObservable = wrapValue(routes, { hydrate: false });
    const routerInstance = options.router || browserRouter();
    const parentNode = getNearestRouter();

    // Calculate the matched path prefix from ancestors
    let parentPrefix = "";
    if (parentNode) {
      let current = parentNode;
      const prefixes = [current.matchedPath];
      while (current.parentId !== undefined) {
        const state = getRouterState();
        const parent = state.tree.get(current.parentId);
        if (!parent) {
          break;
        }
        prefixes.unshift(parent.matchedPath);
        current = parent;
      }
      parentPrefix = prefixes.join("").replace(/\/+$/, "");
    }

    // The local path is the router's pathname minus the prefix from parent routers
    const currentPath = routerInstance.pathname.as((path) => {
      if (path.startsWith(parentPrefix)) {
        const local = path.slice(parentPrefix.length);
        return local.startsWith("/") ? local : `/${local}`;
      }
      return "/";
    });

    const currentParams = createValue<Record<string, string>>({}, { hydrate: false });
    let currentRouteIndex = -1;
    let currentMatchedPath = "";
    //let currentRoute: Route | undefined;
    let currentComponent: SeidrComponent | null = null;
    let currentFactory: SeidrComponentFactoryOrFunction<any> | null = null;

    /**
     * Match the current path against the provided routes.
     */
    const matchCurrentPath = (): RouteMatch =>
      matchRoute(currentPath(), routesObservable()) || { index: -1, params: {}, matchedPath: "" };

    /**
     * Get the component factory for the matched route index.
     */
    const getMatchedFactory = (index: number): SeidrComponentFactoryOrFunction<any> | null =>
      index > -1 ? routesObservable()[index].component : null;

    /**
     * Update the currently rendered component instance.
     */
    const updateComponent = (index: number): SeidrComponent | null => {
      currentFactory = getMatchedFactory(index);
      if (!currentFactory) {
        currentComponent = null;
        return null;
      }
      const prevScope = getComponentScope();
      setComponentScope(routerComponent);
      try {
        if (isComponent(currentFactory)) {
          currentComponent = currentFactory as SeidrComponent;
          currentComponent.owner = routerComponent;
        } else {
          currentComponent = wrapComponent(currentFactory as any, `${name}Route`)();
        }
      } finally {
        setComponentScope(prevScope);
      }
      return currentComponent;
    };

    // Initial match
    const {
      index: initialIndex,
      route: initialRoute,
      params: initialParams,
      matchedPath: initialMatched,
    } = matchCurrentPath();

    if (initialIndex > -1 && initialParams) {
      currentRouteIndex = initialIndex;
      currentParams(initialParams);
      currentMatchedPath = initialMatched;
      //currentRoute = initialRoute;
    }

    // Register in the router tree BEFORE creating child components
    const routerNode = registerRouter(routerComponent, {
      component: routerComponent,
      route: initialRoute,
      router: routerInstance,
      pathname: currentPath,
      routerParams: currentParams,
      childrenIds: new Set<number>(),
      matchedPath: currentMatchedPath,
    });

    updateComponent(currentRouteIndex);

    /**
     * Update the rendered route component on path / routes change.
     */
    const updateRoutes = (): void => {
      const {
        index: matchedIndex,
        route: matchedRoute,
        params: matchedParams,
        matchedPath: matchedPathValue,
      } = matchCurrentPath();
      const matchedFactory = getMatchedFactory(matchedIndex);

      routerNode.matchedPath = matchedPathValue;
      routerNode.route = matchedRoute;

      if (matchedFactory === currentFactory) {
        currentRouteIndex = matchedIndex;
        currentParams(matchedParams);
        return;
      }

      const parent = endMarker?.parentNode || startMarker?.parentNode;

      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }

      currentRouteIndex = matchedIndex;
      currentParams(matchedParams);
      const nextComp = updateComponent(matchedIndex);

      if (nextComp && parent) {
        routerComponent.children.add(nextComp);
        nextComp.isMounted = true;
        for (const node of nextComp.nodes) {
          parent.insertBefore(node, endMarker);
        }
      }

      routerComponent.nodes = [startMarker, ...(nextComp ? nextComp.nodes : []), endMarker];
    };

    routerComponent.onUnmount(currentPath.watch(updateRoutes));
    routerComponent.onUnmount(routesObservable.watch(updateRoutes));
    routerComponent.onUnmount(() => currentComponent?.unmount());

    return [startMarker, ...(currentComponent ? [currentComponent] : []), endMarker];
  }, name)();
