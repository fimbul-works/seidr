// Import ServerHTMLElement for SSR usage (will be tree-shaken in client builds)

import { isHydrating } from "../../../ssr/hydrate";
import { ServerHTMLElement } from "../../../ssr/server-html-element";
import { getRenderContext } from "../../render-context-contract";
import { Seidr } from "../../seidr";
import { cn, uid, unwrapSeidr, wrapSeidr } from "../../util/index";
import { isSeidrElement } from "../../util/is";
import { component, type SeidrComponent, useScope } from "../component";
import { $, $comment, type ReactiveProps, type SeidrElement, type SeidrNode } from "../element";
import { Conditional } from "./conditional";

/** Map to cache Seidr instances per render context ID */
const pathCache = new Map<number, Seidr<string>>();

/** Clear cached path for a render context */
export function clearPathCache(renderContextID: number): void {
  pathCache.delete(renderContextID);
}

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

/** Client-side path state (created once, reused across calls) */
let clientPathState: Seidr<string> | undefined;

/**
 * Get the reactive current path observable.
 *
 * On the client: Returns a module-level Seidr that persists across the session.
 * On the server: Returns a cached Seidr per render context (request-isolated).
 *
 * @returns {Seidr<string>} Reactive current path observable
 */
function getCurrentPath(): Seidr<string> {
  const ctx = getRenderContext();

  // Server-side: Get or create Seidr for this render context
  if (ctx) {
    let pathSeidr = pathCache.get(ctx.renderContextID);

    if (!pathSeidr) {
      // Create a new Seidr for this render context
      pathSeidr = new Seidr(ctx.currentPath);
      pathCache.set(ctx.renderContextID, pathSeidr);
    } else {
      // Update the cached Seidr with the current path from context
      // This allows renderToString to set different paths for different renders
      pathSeidr.value = ctx.currentPath;
    }

    return pathSeidr;
  }

  // Client-side: Use module-level state
  if (!clientPathState) {
    clientPathState = new Seidr(typeof window !== "undefined" ? window.location.pathname : "/");
  }
  return clientPathState;
}

/** Remove traailing slashes from path */
const normalizePath = (path: string) => path.replace(/\/+$/, "");

/**
 * Initialize Seidr router.
 * @param {string} path - Current URL path
 * @returns {() => void} Cleanup function that stops listening to path change events.
 */
export function initRouter(path: string = typeof window !== "undefined" ? window.location.pathname : "/"): () => void {
  // Set the initial path value
  const currentPath = getCurrentPath();
  currentPath.value = path;

  // Return noop in SSR
  if (typeof window === "undefined") {
    return () => {};
  }

  // Handle history.back
  const popStateHandler = () => {
    currentPath.value = window.location.pathname;
  };
  window.addEventListener("popstate", popStateHandler);

  // Return cleanup function (capture window reference for closure)
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", popStateHandler);
    }
  };
}

/**
 * Navigate to path.
 * @param {string} path
 */
export function navigate(path: string): void {
  // Strip hash and query string for routing purposes
  // window.location.pathname doesn't include these, but navigate() might receive them
  const cleanPath = path.split(/[?#]/)[0];

  // Set the new path
  const currentPath = getCurrentPath();
  currentPath.value = cleanPath;

  // Stop in SSR
  if (typeof window === "undefined") {
    return;
  }

  // Push path to history
  window.history.pushState({}, "", cleanPath);
}

/**
 * Try to match pattern with path, and parse Route parameters.
 * @param {string} pattern - Path pattern like `"/user/:id/edit"`
 * @param {string} path - Optional URL pathname to match against (default: current path)
 * @returns {Record<string, string> | false} Object with matching parameters, or `false` when pattern and path do not match
 */
export function parseRouteParams(pattern: string, path?: string): Record<string, string> | false {
  // If no path provided, use current path
  const pathToMatch = path ?? getCurrentPath().value;

  // Normalize paths by removing trailing slashes
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(pathToMatch);

  const parts = normalizedPattern.split("/");
  const pathParts = normalizedPath.split("/");

  // Ensure path and pattern have equal number of parts
  if (parts.length !== pathParts.length) {
    return false;
  }

  // Collect parameters
  const params = {} as Record<string, string>;
  for (let i = 0; i < parts.length; i++) {
    // Parameters start with ":"
    if (parts[i].startsWith(":")) {
      params[parts[i].slice(1)] = pathParts[i];
    } else if (parts[i] !== pathParts[i]) {
      // Return false on mismatch
      return false;
    }
  }

  return params;
}

/**
 * Conditionally mount a SeidrComponent when current URL path matches pattern
 *
 * IMPORTANT: The componentFactory must be a factory function (not an instantiated component).
 * When you call component() without the trailing (), you get a factory that can be called
 * multiple times to create new instances. This is required because routes need to create
 * fresh component instances each time the route changes.
 *
 * @template {SeidrComponent} C - The type of SeidrComponent being conditionally rendered
 * @template {Seidr<any>} P - The type of matching route parameters
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {(params?: P) => C} componentFactory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {() => void} Cleanup function that removes the conditional mount
 *
 * @example
 * Correct usage with Route
 * ```typescript
 * // Without params - pass the factory (no trailing parentheses)
 * const Home = component(() => $div({ textContent: 'Home' }));
 * Route('/', Home)
 *
 * // With params - function that returns a new instance each time
 * const UserPage = (params?: Seidr<{id: string}>) => component(() => {
 *   return $div({ textContent: params?.as(p => `User ${p.id}`) || 'Loading' });
 * })();
 * Route('/user/:id', UserPage)
 * ```
 */
export function Route<C extends SeidrComponent, P extends Seidr<any>>(
  pattern: string | RegExp,
  componentFactory: (params?: P) => C,
  pathState: Seidr<string> = getCurrentPath(),
) {
  // Match pathState.value against RegExp pattern (no parameters extracted)
  if (pattern instanceof RegExp) {
    const routeParams = pathState.as((path) => {
      const match = path.match(pattern);
      if (!match) return false;

      // Extract named groups as params
      return match.groups ?? {};
    });

    const isMatch = routeParams.as((params) => !!params);
    return Conditional(isMatch, () => componentFactory(routeParams as P));
  }

  // Attempt to match path with pattern (parseRouteParams handles normalization)
  const routeParams = pathState.as((path) => parseRouteParams(pattern, path));

  // Mount if params are truthy
  const match = routeParams.as((params) => !!params);
  return Conditional(match, () => componentFactory(routeParams as P));
}

/**
 * Route definition for Router.
 */
export interface RouteDefinition<C extends SeidrComponent, P extends Seidr<any>> {
  pattern: string | RegExp;
  componentFactory: (params?: P) => C;
}

/**
 * Create a route definition for use with Router.
 *
 * Helper function to create type-safe route definitions with proper TypeScript inference.
 *
 * @template {SeidrComponent<any>} C - The component type
 * @template {Seidr<any>} P - The params observable type
 * @param {string | RegExp} pattern - Path pattern or RegExp
 * @param {C | (params?: P) => C} componentOrFactory - The component (created with component()) or a factory function that returns a component
 * @returns {RouteDefinition<C, P>} Route definition object
 *
 * @example
 * Creating a route without params
 * ```typescript
 * import { createRoute, component, $div } from '@fimbul-works/seidr';
 *
 * const HomePage = component(() => $div({ textContent: 'Home' }));
 *
 * const route = createRoute('/', HomePage);
 * ```
 *
 * @example
 * Creating a route with params
 * ```typescript
 * import { createRoute, component, $div } from '@fimbul-works/seidr';
 *
 * const UserPage = (params?: Seidr<{id: string}>) => component(() => {
 *   return $div({ textContent: params?.as((p) => `User ${p.id}`) || 'Loading' });
 * });
 *
 * const route = createRoute('/user/:id', UserPage);
 * ```
 */
export function createRoute<C extends SeidrComponent>(
  pattern: string | RegExp,
  componentOrFactory: C | ((params?: Seidr<any>) => C),
): RouteDefinition<C, any> {
  // Check if it's already a factory function (has params)
  if (typeof componentOrFactory === "function") {
    // It's a factory function - use it directly
    return { pattern, componentFactory: componentOrFactory as (params?: Seidr<any>) => C };
  } else {
    // It's a component instance - this is incorrect usage but we'll handle it
    // The correct pattern is to pass the factory (without calling it)
    // TODO: Consider throwing an error here to catch this mistake at compile time
    return { pattern, componentFactory: () => componentOrFactory };
  }
}

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
        params = match ? match.groups || {} : false;
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
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  to: string | Seidr<string>;
  tagName?: K;
  activeClass?: string;
  activeProp?: string;
  activeValue?: string;
  className?: string | Seidr<string>;
}

/**
 * Link component for Route.
 * @param {LinkProps & ReactiveProps<K, HTMLElementTagNameMap[K]>} props - Link props with reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {SeidrComponent<K, SeidrElement<K>>} SeidrComponent that wraps an anchor element
 *
 * @example
 * Basic Link
 * ```typescript
 * import { Link, component, $div } from '@fimbul-works/seidr';
 *
 * const App = component(() => {
 *   return $div({}, [
 *     Link({ to: '/about' }, ['About']),
 *     Link({ to: '/', activeClass: 'current' }, ['Home'])
 *   ]);
 * });
 * ```
 *
 * @example
 * Link with custom tagName and reactive active state
 * ```typescript
 * const currentPath = new Seidr('/');
 *
 * const App = component(() => {
 *   return $div({}, [
 *     Link({
 *       to: currentPath.as(p => p === '/home' ? '/' : '/home'),
 *       tagName: 'button',
 *       activeProp: 'aria-current',
 *       activeValue: 'page'
 *     }, ['Home'])
 *   ]);
 * });
 * ```
 */
export function Link<K extends keyof HTMLElementTagNameMap = "a">(
  {
    to,
    tagName = "a" as K,
    activeClass = "active",
    activeProp = "className",
    activeValue = undefined,
    className,
    ...restProps
  }: LinkProps<K> & ReactiveProps<K, HTMLElementTagNameMap[K]>,
  children: (SeidrNode | (() => SeidrNode))[] = [],
): SeidrComponent<SeidrElement<K>> {
  return component(() => {
    const scope = useScope();

    // If to is a Seidr, observe it; otherwise wrap it in a Seidr
    const toValue = wrapSeidr(to);
    const val = activeValue ?? activeClass;
    const currentPath = getCurrentPath();

    // Create a combined computed that depends on both currentPath and toValue
    const isActive = Seidr.computed(
      () => normalizePath(currentPath.value) === normalizePath(unwrapSeidr(toValue)),
      [currentPath, toValue],
    );

    // Build props object with reactive bindings
    const props: Record<string, any> = {
      ...restProps,
      href: toValue,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapSeidr(toValue));
      },
    };

    // Handle className reactively if activeProp is className
    if (activeProp === "className") {
      props.className = isActive.as((active) => cn(active ? val : "", className));
    } else {
      props.className = className;
      // Set up reactive binding for custom prop (like aria-current)
      const activeValueBinding = new Seidr<string | null>(val);
      scope.track(isActive.bind(activeValueBinding, (active, binding) => (binding.value = active ? val : null)));
      props[activeProp] = activeValueBinding;
    }

    return $(tagName as K, props as any, children);
  })();
}
