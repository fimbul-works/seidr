import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../component/types.js";
import type { Value } from "../observable/value.js";

/**
 * `window.onpopstate` listener type for router URL changes.
 */
export type PopstateListener = (url: string) => void;

/**
 * Route definition for Router.
 */
export interface Route {
  path: string | RegExp;
  component: SeidrComponentFactoryOrFunction<any>;
  exact?: boolean;
}

/**
 * History interface.
 */
export interface History {
  /**
   * Navigate to a new location.
   */
  push: (location: string) => void;

  /**
   * Replace the current location.
   */
  replace: (location: string) => void;

  /**
   * Navigate to a location by delta.
   */
  go: (delta: number) => void;
}

/**
 * Router interface.
 */
export interface RouterInterface {
  /**
   * Navigate to a new location.
   */
  push: (location: string) => void;

  /**
   * Replace the current location.
   */
  replace: (location: string) => void;

  /**
   * Navigate to a location by delta.
   */
  go: (delta: number) => void;

  /**
   * Current pathname observable.
   */
  pathname: Value<string>;

  /**
   * Current search parameters observable.
   */
  searchParams: Value<Record<string, string>>;

  /**
   * Current route parameters observable.
   */
  routeParams: Value<Record<string, string>>;
}

/**
 * Node in the route tree used for nested routes.
 */
export interface RouterTreeNode {
  /** Component instance of the router */
  component: SeidrComponent;
  /** Route definition */
  route?: Route;
  /** Current path */
  pathname: Value<string>;
  /** Router instance */
  router: RouterInterface;
  /** Current parameters */
  routerParams: Value<Record<string, string>>;
  /** Parent router ID, if any */
  parentId?: number;
  /** Child router IDs */
  childrenIds: Set<number>;
  /** The portion of the path that was matched by this router */
  matchedPath: string;
}

/**
 * Match result for a route, containing the index of the matched route and the extracted parameters.
 */
export interface RouteMatch {
  /** Route index */
  index: number;
  /** Route definition */
  route?: Route;
  /** Extracted route parameters */
  params: Record<string, string>;
  /** The portion of the path that was matched */
  matchedPath: string;
}

/**
 * Global router state stored in AppState.
 */
export interface RouterState {
  /** URL for the router */
  url: Value<URL>;
  /** Router tree nodes */
  tree: Map<number, RouterTreeNode>;
  /** Parent router map */
  parentMap: Map<number, RouterTreeNode | null>;
  /** Popstate listeners */
  popstateListeners: Set<PopstateListener>;
}
