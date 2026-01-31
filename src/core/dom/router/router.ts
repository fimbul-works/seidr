import { component, type SeidrComponent } from "../../../dom/component/component";
import { useScope } from "../../../dom/component/use-scope";
import { wrapComponent } from "../../../dom/component/wrap-component";
import { $comment, type SeidrNode } from "../../../dom/element/element";
import { isHydrating } from "../../../ssr/hydrate";
import { ServerHTMLElement } from "../../../ssr/server-html-element";
import { Seidr } from "../../../state/seidr";
import { NO_HYDRATE, uid } from "../../../util/index";
import { getRenderContext } from "../../render-context-contract";
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
 * @returns {SeidrComponent<Comment>} SeidrComponent that manages route rendering
 */
export const Router = component(({ routes, fallback }: RouterProps) => {
  const scope = useScope();
  const ctx = getRenderContext();

  // Use a unique ID for this router instance
  // During SSR, we use a counter to ensure deterministic IDs for hydration
  const instanceId = ctx ? ctx.idCounter++ : uid();
  const routerId = ctx ? `ctx-${ctx.ctxID}-${instanceId}` : uid();

  // Detect SSR mode
  const isSSR = typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);

  // Markers used to delimit the router's content in the DOM
  let startMarker: Comment;
  let endMarker: Comment;

  if (isHydrating) {
    const [existingStart, existingEnd] = findExistingMarkers(routerId);
    if (existingStart && existingEnd) {
      startMarker = existingStart;
      endMarker = existingEnd;
    } else {
      // Fallback if markers not found during hydration (should not happen normally)
      startMarker = $comment(`router-start:${routerId}`);
      endMarker = $comment(`router-end:${routerId}`);
    }
  } else {
    startMarker = $comment(`router-start:${routerId}`);
    endMarker = $comment(`router-end:${routerId}`);

    if (isSSR) {
      const wrapper = new ServerHTMLElement("div");

      // Append markers using the internal children array or cast to any,
      // as ServerHTMLElement.appendChild signature might be strict
      (wrapper as any).appendChild(startMarker);
      (wrapper as any).appendChild(endMarker);

      (startMarker as any)._ssrWrapper = wrapper;
    }
  }

  const currentPath = getCurrentPath();

  let currentRouteIndex = -100; // Initialize to a value that won't match any index or fallback
  let currentComponent: SeidrComponent | null = null;
  let currentParamsSeidr: Seidr<Record<string, string>> | null = null;

  /**
   * Clears all nodes between startMarker and endMarker.
   */
  const clearContent = () => {
    if (!startMarker.parentNode) return;
    let current = startMarker.nextSibling;
    while (current && current !== endMarker) {
      const next = current.nextSibling;
      // We MUST call remove on the element. If it's a SeidrElement, it has remove()
      if (current.remove) {
        current.remove();
      } else {
        current.parentNode?.removeChild(current);
      }
      current = next;
    }
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
    currentComponent?.destroy();
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

    if (isSSR && startMarker.parentElement) {
      const parent = startMarker.parentElement as any;
      if (parent.children) {
        const endIndex = parent.children.indexOf(endMarker);
        if (endIndex !== -1) {
          parent.children.splice(endIndex, 0, comp.element);
        }
      }
    } else if (startMarker.parentNode) {
      startMarker.parentNode.insertBefore(comp.element as Node, endMarker);
      if (comp.scope.onAttached) {
        comp.scope.onAttached(startMarker.parentNode);
      }
    }
  };

  // Re-run matching whenever path changes
  scope.track(currentPath.observe(updateRoutes));

  // Cleanup: destroy active component
  scope.track(() => {
    currentComponent?.destroy();
    currentComponent = null;
    currentParamsSeidr = null;
    startMarker.remove();
    endMarker.remove();
  });

  // Ensure markers and content are mounted when parent is ready
  scope.onAttached = (parent) => {
    // Insert endMarker if not present
    // In SSR, parent is ServerHTMLElement. In Client, it's HTMLElement.
    const inDOM = endMarker.parentNode;
    if (!inDOM && parent) {
      if (startMarker.nextSibling) {
        parent.insertBefore(endMarker, startMarker.nextSibling);
      } else {
        parent.appendChild(endMarker);
      }
    }
    updateRoutes();
  };

  if (isSSR) {
    updateRoutes();
  }

  return startMarker as any;
});

/**
 * Find existing router markers in the DOM by router ID.
 */
function findExistingMarkers(routerId: string): [Comment | null, Comment | null] {
  if (typeof document === "undefined") return [null, null];

  const startMarkerPattern = `router-start:${routerId}`;
  const endMarkerPattern = `router-end:${routerId}`;

  let startMarker: Comment | null = null;
  let endMarker: Comment | null = null;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
  let node: Comment | null;
  while ((node = walker.nextNode() as Comment | null)) {
    if (node.nodeValue === startMarkerPattern) startMarker = node;
    else if (node.nodeValue === endMarkerPattern) endMarker = node;
    if (startMarker && endMarker) break;
  }

  return [startMarker, endMarker];
}
