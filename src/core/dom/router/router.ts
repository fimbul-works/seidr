import { isHydrating } from "../../../ssr/hydrate";
import { ServerHTMLElement } from "../../../ssr/server-html-element";
import { getRenderContext } from "../../render-context-contract";
import { Seidr } from "../../seidr";
import { uid } from "../../util/index";
import { isSeidrElement } from "../../util/is";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment, type SeidrElement } from "../element";
import type { RouteDefinition } from "./create-route";
import { getCurrentPath } from "./get-current-path";
import { parseRouteParams } from "./parse-route-params";

/**
 * Router component props.
 */
export interface RouterProps {
  routes: Array<RouteDefinition<any, any>>;
  fallback?: SeidrComponent<any> | (() => SeidrComponent<any>);
}

/**
 * Router component - renders the first matching route or a fallback.
 *
 * Routes are evaluated in order, so more specific routes should be placed
 * before less specific ones (e.g., "/user/:id" before "/user/*").
 *
 * @param {RouterProps} props - Router props containing routes and optional fallback
 * @returns {SeidrComponent<Comment>} SeidrComponent that manages route rendering
 *
 * @example
 * Basic Router with fallback
 * ```typescript
 * import { Router, createRoute, component, $ } from '@fimbul-works/seidr';
 *
 * const HomePage = component(() => $('div', { textContent: 'Home' }));
 * const AboutPage = component(() => $('div', { textContent: 'About' }));
 * const NotFoundPage = component(() => $('div', { textContent: '404 - Not Found' }));
 *
 * const App = component(() =>
 *   Router({
 *     routes: [
 *       createRoute('/', HomePage),
 *       createRoute('/about', AboutPage),
 *     ],
 *     fallback: NotFoundPage
 *   })
 * );
 * ```
 */
export const Router = component(({ routes, fallback }: RouterProps) => {
  const scope = useScope();

  // Create markers with renderContextID for deterministic IDs during SSR
  // Falls back to uid() on client-side when no render context exists
  const ctx = getRenderContext();
  const routerId = ctx ? `ctx-${ctx.renderContextID}` : uid();

  // During hydration, try to find existing markers from SSR
  let startMarker: Comment;
  let endMarker: Comment;

  if (isHydrating) {
    const [existingStart, existingEnd] = findExistingMarkers(routerId);
    if (existingStart && existingEnd) {
      startMarker = existingStart;
      endMarker = existingEnd;
    } else {
      startMarker = $comment(`router-start:${routerId}`);
      endMarker = $comment(`router-end:${routerId}`);
    }
  } else {
    // Not hydrating, create new markers
    startMarker = $comment(`router-start:${routerId}`);
    endMarker = $comment(`router-end:${routerId}`);
  }

  const currentPath = getCurrentPath();

  let currentRouteIndex = -1;
  let currentComponent: SeidrComponent<any> | null = null;
  let currentParamsSeidr: Seidr<Record<string, string>> | null = null;
  let renderedElements: SeidrElement[] = [];
  let pendingComponent: SeidrComponent<any> | null = null; // Component created but not yet inserted

  const updateRoutes = () => {
    const path = currentPath.value;
    let matchedIndex = -1;
    let params: Record<string, string> | false = false;

    // Find matching route
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];

      if (route.pattern instanceof RegExp) {
        const match = path.match(route.pattern);
        params = match ? (match.groups ?? {}) : false;
      } else {
        params = parseRouteParams(route.pattern, path);
      }

      if (params) {
        matchedIndex = i;
        break;
      }
    }

    const routeChanged = matchedIndex !== currentRouteIndex;

    // Special case: if showing fallback and path changed, always treat as route changed
    // This ensures fallback components are recreated to re-run their initialization code
    const isFallback = matchedIndex === -1 && fallback !== undefined;
    const shouldRecreateFallback = isFallback && currentRouteIndex === -1;
    const forceUpdate = routeChanged || shouldRecreateFallback;

    // During initial hydration, don't recreate components if they already exist
    const isInitialHydration =
      isHydrating && currentRouteIndex === -1 && matchedIndex === -1 && currentComponent === null;

    const isSSR = typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);

    // PHASE 1: Collect nodes to remove (before adding new content)
    const nodesToRemove: SeidrElement[] = [];
    for (const el of renderedElements) {
      // Remove if route changed or fallback needs recreation
      if (forceUpdate) {
        nodesToRemove.push(el);
      }
    }

    // PHASE 2: Render new component or update params
    if (matchedIndex === -1) {
      // No route matched - show fallback or clear current route
      if (currentRouteIndex !== -1 || forceUpdate) {
        // Switching from route to fallback, or recreating fallback
        // Destroy current component
        currentComponent?.destroy();
        currentComponent = null;
        currentParamsSeidr = null;
        renderedElements = [];
      }

      if (fallback) {
        // During initial hydration, check if there's SSR content to replace
        if (isInitialHydration) {
          // Check if there's already content between the markers
          let hasSSRContent = false;
          let current = startMarker.nextSibling;
          while (current && current !== endMarker) {
            if (!isSeidrElement(current)) {
              hasSSRContent = true;
              break;
            }
            current = current.nextSibling;
          }
          if (hasSSRContent) {
            // Remove all SSR-rendered elements between markers
            current = startMarker.nextSibling;
            while (current && current !== endMarker) {
              const next = current.nextSibling;
              if (!isSeidrElement(current)) {
                // Remove SSR element (not a SeidrElement)
                current.remove();
              }
              current = next;
            }
            // Continue to create new reactive component below
          }
        }

        // Always create new fallback component when path changes
        // This ensures the component function body runs (including inBrowser callbacks)
        currentComponent = typeof fallback === "function" ? fallback() : fallback;
        renderedElements = [currentComponent!.element];

        if (isSSR && startMarker.parentElement) {
          // During SSR, append to parent's children array
          const parent = startMarker.parentElement as any;
          if (parent.children) {
            // Find index of endMarker and insert before it
            const endIndex = parent.children.indexOf(endMarker);
            parent.children.splice(endIndex, 0, currentComponent!.element);
          }
        } else if (startMarker.parentNode) {
          // Client-side: use normal DOM insertion
          startMarker.parentNode.insertBefore(currentComponent!.element, endMarker);

          // Call onAttached to initialize the component
          if (currentComponent!.scope.onAttached) {
            currentComponent!.scope.onAttached(startMarker.parentNode);
          }
        } else {
          // Markers not in DOM yet - store as pending for later insertion
          pendingComponent = currentComponent;
        }
      }

      currentRouteIndex = -1;
    } else if (routeChanged) {
      // Route changed - full swap
      currentComponent?.destroy();
      currentComponent = null;
      currentParamsSeidr = null;
      renderedElements = [];

      // During initial hydration, skip creating component if content already exists
      const isInitialRouteHydration = isHydrating && currentRouteIndex === -1 && matchedIndex !== -1;

      if (!isInitialRouteHydration) {
        // Create new component with fresh params Seidr
        // params is guaranteed to be a Record here (not false) since matchedIndex !== -1
        currentParamsSeidr = new Seidr(params as Record<string, string>);
        currentComponent = routes[matchedIndex].componentFactory(currentParamsSeidr);
        renderedElements = [currentComponent!.element];

        if (isSSR && startMarker.parentElement) {
          // During SSR, append to parent's children array
          const parent = startMarker.parentElement as any;
          if (parent.children) {
            const endIndex = parent.children.indexOf(endMarker);
            parent.children.splice(endIndex, 0, currentComponent!.element);
          }
        } else if (startMarker.parentNode) {
          // Client-side: use normal DOM insertion
          startMarker.parentNode.insertBefore(currentComponent!.element, endMarker);

          if (currentComponent!.scope.onAttached) {
            currentComponent!.scope.onAttached(startMarker.parentNode);
          }
        }
      } else {
        // Check if there's already content between the markers
        let hasSSRContent = false;
        let current = startMarker.nextSibling;
        while (current && current !== endMarker) {
          if (current.nodeType === Node.ELEMENT_NODE) {
            hasSSRContent = true;
            break;
          }
          current = current.nextSibling;
        }
        if (hasSSRContent) {
          // Remove all SSR-rendered elements between markers
          current = startMarker.nextSibling;
          while (current && current !== endMarker) {
            const next = current.nextSibling;
            if (current.nodeType === Node.ELEMENT_NODE && !isSeidrElement(current)) {
              // Remove SSR element (not a SeidrElement)
              current.remove();
            }
            current = next;
          }
          // Continue to create new reactive component below
        }

        // Create new component with fresh params Seidr
        currentParamsSeidr = new Seidr(params as Record<string, string>);
        currentComponent = routes[matchedIndex].componentFactory(currentParamsSeidr);
        renderedElements = [currentComponent!.element];

        if (isSSR && startMarker.parentElement) {
          // During SSR, append to parent's children array
          const parent = startMarker.parentElement as any;
          if (parent.children) {
            const endIndex = parent.children.indexOf(endMarker);
            parent.children.splice(endIndex, 0, currentComponent!.element);
          }
        } else if (startMarker.parentNode) {
          // Client-side: use normal DOM insertion
          startMarker.parentNode.insertBefore(currentComponent!.element, endMarker);

          if (currentComponent!.scope.onAttached) {
            currentComponent!.scope.onAttached(startMarker.parentNode);
          }
        }
      }

      currentRouteIndex = matchedIndex;
    } else if (currentParamsSeidr) {
      // Same route, only params changed - update existing Seidr
      // params is guaranteed to be a Record here (not false) since matchedIndex === currentRouteIndex and both !== -1
      currentParamsSeidr.value = params as Record<string, string>;
    }

    // PHASE 3: Destroy removed components
    for (const el of nodesToRemove) {
      // Remove from DOM
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      // Remove from renderedElements array
      const idx = renderedElements.indexOf(el);
      if (idx > -1) {
        renderedElements.splice(idx, 1);
      }
    }
  };

  // Detect SSR mode
  const isSSR = typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);

  // Re-render when path changes
  scope.track(currentPath.observe(updateRoutes));

  // Cleanup: destroy component and remove markers
  scope.track(() => {
    currentComponent?.destroy();
    currentComponent = null;
    currentParamsSeidr = null;
    startMarker.remove();
    endMarker.remove();
  });

  if (isSSR) {
    // Server-side: Create a temporary wrapper to hold markers during rendering
    // The wrapper won't be part of the final output - we'll return startMarker
    const wrapper = new ServerHTMLElement("div", {}, [startMarker as any, endMarker as any]);

    // Markers are now in DOM, call updateRoutes to render content
    updateRoutes();

    // Store wrapper reference on startMarker for renderToString to use
    (startMarker as any)._ssrWrapper = wrapper;

    // Return startMarker (renderToString will handle the wrapper specially)
    return startMarker as any;
  } else {
    // Client-side: Set up onAttached to insert endMarker and render routes
    scope.onAttached = (_parent) => {
      // Check if markers are already in DOM (from SSR hydration)
      const markersAlreadyInDOM = startMarker.parentNode && endMarker.parentNode;

      if (!markersAlreadyInDOM) {
        // Insert endMarker after startMarker
        if (startMarker.parentNode && !endMarker.parentNode) {
          startMarker.parentNode.insertBefore(endMarker, startMarker.nextSibling);
        }

        // If there's a pending component (created before Router was mounted), insert it now
        if (pendingComponent && startMarker.parentNode) {
          startMarker.parentNode.insertBefore(pendingComponent.element, endMarker);
          if (pendingComponent.scope.onAttached) {
            pendingComponent.scope.onAttached(startMarker.parentNode);
          }
          pendingComponent = null;
        }
      } else {
        // Markers already in place from SSR, just check for pending component
        if (pendingComponent && startMarker.parentNode) {
          startMarker.parentNode.insertBefore(pendingComponent.element, endMarker);
          if (pendingComponent.scope.onAttached) {
            pendingComponent.scope.onAttached(startMarker.parentNode);
          }
          pendingComponent = null;
        }
      }

      // Now that both markers are in DOM, render routes
      updateRoutes();
    };

    // Return startMarker (no wrapper needed on client-side)
    return startMarker as any;
  }
});

/**
 * Find existing router markers in the DOM by renderContextID.
 * Searches the entire document for marker comments with the given ID.
 *
 * @param {string} routerId - The router ID (e.g., "ctx-2" or a uid)
 * @returns {[Comment | null, Comment | null]} Tuple of [startMarker, endMarker] or null if not found
 */
function findExistingMarkers(routerId: string): [startMarker: Comment | null, endMarker: Comment | null] {
  if (typeof document === "undefined") {
    return [null, null];
  }

  const startMarkerPattern = `router-start:${routerId}`;
  const endMarkerPattern = `router-end:${routerId}`;

  let startMarker: Comment | null = null;
  let endMarker: Comment | null = null;

  // Use TreeWalker for efficient DOM traversal
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, {
    acceptNode: (node) => {
      const comment = node as Comment;
      if (comment.nodeValue?.includes(startMarkerPattern)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      if (comment.nodeValue?.includes(endMarkerPattern)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });

  let node: Comment | null;
  while ((node = walker.nextNode() as Comment | null)) {
    if (node.nodeValue?.includes(startMarkerPattern)) {
      startMarker = node;
    } else if (node.nodeValue?.includes(endMarkerPattern)) {
      endMarker = node;
    }

    // Found both markers, stop searching
    if (startMarker && endMarker) {
      break;
    }
  }

  return [startMarker, endMarker];
}
