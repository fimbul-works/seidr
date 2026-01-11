import { Seidr } from "../../seidr";
import { cn, isSeidr, uid, unwrapSeidr } from "../../util/index";
import { component, type SeidrComponent } from "../component";
import { $, $comment, type ReactiveARIAMixin, type ReactiveProps, type SeidrElement, type SeidrNode } from "../element";
import { Conditional } from "./conditional";

/** Reactive current URL path */
const currentPath = new Seidr<string>("");

/** Remove traailing slashes from path */
const normalizePath = (path: string) => path.replace(/\/+$/, "");

/**
 * Initialize Seidr router.
 * @param {string} path - Current URL path
 * @returns {() => void} Cleanup function that stops listening to path change events.
 */
export function initRouter(path: string = typeof window !== "undefined" ? window.location.pathname : "/"): () => void {
  // Set the initial path value
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
 * @param {string} path - Optional URL pathname to match against (default: `currentPath.value`)
 * @returns {Record<string, string> | false} Object with matching parameters, or `false` when pattern and path do not match
 */
export function parseRouteParams(pattern: string, path: string = currentPath.value): Record<string, string> | false {
  // Normalize paths by removing trailing slashes
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(path);

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
 * @template {Record<string, string>} P - The type of matching route parameters
 * @param {string | RegExp} pattern - Path pattern like `"/user/:id/edit"` or `RegExp`
 * @param {(params?: P) => C} componentFactory - Function that creates the component when needed
 * @param {Seidr<string>} pathState - Optional current path state (default: `currentPath`)
 * @returns {() => void} Cleanup function that removes the conditional mount
 */
export function Route<
  C extends SeidrComponent<any, any>,
  P extends Seidr<Record<string, string>> = Seidr<Record<string, string>>,
>(pattern: string | RegExp, componentFactory: (params?: P) => C, pathState: Seidr<string> = currentPath) {
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
export interface RouteDefinition<C extends SeidrComponent<any, any>, P extends Seidr<Record<string, string>>> {
  pattern: string | RegExp;
  componentFactory: (params?: P) => C;
}

/**
 * Router component props.
 */
export interface RouterProps {
  routes: Array<RouteDefinition<any, any>>;
  fallback?: SeidrComponent<any, any>;
}

/**
 * Router component - renders the first matching route or a fallback.
 *
 * Routes are evaluated in order, so more specific routes should be placed
 * before less specific ones (e.g., "/user/:id" before "/user/*").
 *
 * @param {RouterProps} props - Router props containing routes and optional fallback
 * @returns {SeidrComponent<"div", SeidrElement<"div">>} SeidrComponent that manages route rendering
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
export function Router({ routes, fallback }: RouterProps): SeidrComponent<any, Comment> {
  return component((scope) => {
    const marker = $comment(`router:${uid()}`);

    let currentComponent: SeidrComponent<any, any> | null = null;

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
        currentComponent = fallback;

        if (marker.parentNode) {
          marker.parentNode.insertBefore(currentComponent.element, marker);
        }

        if (currentComponent.onAttached) {
          currentComponent.onAttached(marker.parentNode!);
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
}

/**
 * Link component props.
 */
export interface LinkProps extends Partial<ReactiveProps<any, any> & ReactiveARIAMixin> {
  to: string;
  tagName?: string;
  activeClass?: string;
  activeProp?: string;
  activeValue?: string;
}

/**
 * Link component for Route.
 * @param {LinkProps} props - Link props
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {SeidrComponent<"a", SeidrElement<"a">>} SeidrComponent that wraps an anchor element
 */
export function Link<K extends keyof HTMLElementTagNameMap>(
  {
    tagName = "a",
    to,
    className,
    activeClass = "active",
    activeProp = "className",
    activeValue,
    ...restProps
  }: LinkProps,
  children: (SeidrNode | (() => SeidrNode))[] = [],
): SeidrComponent<K, SeidrElement<K>> {
  return component((scope) => {
    // If to is a Seidr, observe it; otherwise wrap it in a Seidr
    const toValue = isSeidr(to) ? to : new Seidr(to);
    const val = activeValue ?? activeClass;

    // Create a combined computed that depends on both currentPath and toValue
    const isActive = Seidr.computed(
      () => normalizePath(currentPath.value) === normalizePath(unwrapSeidr(toValue.value)),
      [currentPath, toValue],
    );

    // Build props object with reactive bindings
    const props: Record<string, any> = {
      ...restProps,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapSeidr(toValue.value));
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
  });
}
