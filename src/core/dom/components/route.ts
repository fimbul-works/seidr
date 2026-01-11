import { getRenderContext } from "../../render-context-contract";
import { Seidr } from "../../seidr";
import { cn, isSeidr, uid, unwrapSeidr, wrapSeidr } from "../../util/index";
import { component, type SeidrComponent, useScope } from "../component";
import { $, $comment, type ReactiveProps, type SeidrElement, type SeidrNode } from "../element";
import { Conditional } from "./conditional";

/** Map to cache Seidr instances per render context ID */
const pathCache = new Map<number, Seidr<string>>();

/** Clear cached path for a render context */
export function clearPathCache(renderContextID: number): void {
  pathCache.delete(renderContextID);
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

  console.log("initRouter", path);

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
 * @template {SeidrComponent} C - The type of SeidrComponent being conditionally rendered
 * @template {Seidr<any>} P - The type of matching route parameters
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {(params?: P) => C} componentFactory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: current path)
 * @returns {() => void} Cleanup function that removes the conditional mount
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
      return match.groups || {};
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
 * @param {(params?: P) => C} componentFactory - Function that creates the component
 * @returns {RouteDefinition<C, P>} Route definition object
 *
 * @example
 * Creating a route
 * ```typescript
 * import { createRoute, component, $div } from '@fimbul-works/seidr';
 *
 * const HomePage = () => component(() => $div({ textContent: 'Home' }));
 *
 * const route = createRoute('/', HomePage);
 * ```
 */
export function createRoute<C extends SeidrComponent>(
  pattern: string | RegExp,
  componentFactory: (params?: Seidr<any>) => C,
): RouteDefinition<C, any> {
  return { pattern, componentFactory };
}

/**
 * Router component props.
 */
export interface RouterProps {
  routes: Array<RouteDefinition<any, any>>;
  fallback?: () => SeidrComponent<any>;
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
  const marker = $comment(`router:${uid()}`);
  const currentPath = getCurrentPath();

  let currentComponent: SeidrComponent<any> | null = null;

  const updateRoutes = () => {
    const path = currentPath.value;
    let matched = false;

    // Clean up previous component
    if (currentComponent) {
      currentComponent.destroy();
      currentComponent = null;
    }

    // Try each route in order
    for (const route of routes) {
      let params: Record<string, string> | false;

      if (route.pattern instanceof RegExp) {
        const match = path.match(route.pattern);
        params = match ? match.groups || {} : false;
      } else {
        params = parseRouteParams(route.pattern, path);
      }

      if (params) {
        // Found a match - wrap params in Seidr observable and mount component
        const paramsObservable = new Seidr(params);
        currentComponent = route.componentFactory(paramsObservable);

        if (marker.parentNode) {
          marker.parentNode.insertBefore(currentComponent!.element, marker);
        }

        if (currentComponent!.onAttached) {
          currentComponent!.onAttached(marker.parentNode!);
        }

        matched = true;
        break;
      }
    }

    // No route matched - show fallback
    if (!matched && fallback) {
      // Create a new instance of the fallback component
      currentComponent = fallback();

      if (marker.parentNode) {
        marker.parentNode.insertBefore(currentComponent!.element, marker);
      }

      if (currentComponent!.onAttached) {
        currentComponent!.onAttached(marker.parentNode!);
      }
    }
  };

  // Initial render when attached to DOM
  scope.onAttached = () => {
    updateRoutes();
  };

  // Re-render when path changes
  scope.track(currentPath.observe(updateRoutes));

  // Cleanup on destroy
  scope.track(() => {
    if (currentComponent) {
      currentComponent.destroy();
      currentComponent = null;
    }
  });

  return marker;
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
