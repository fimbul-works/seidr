import type { SeidrChild } from "../element/types.js";
import { createValue } from "../observable/value.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { isServer } from "../util/environment/is-server.js";
import { isFn, isObj } from "../util/type-guards.js";
import { wrapError } from "../util/wrap-error.js";
import { createComponent } from "./create-component.js";
import { getComponentScope, setComponentScope } from "./lifecycle/component-scope.js";
import { onUnmounted } from "./lifecycle/on-unmounted.js";
import type {
  SeidrComponentFactory,
  SeidrComponentFactoryOrFunction,
  SeidrComponentFactoryPureFunction,
} from "./types.js";
import { wrapComponent } from "./wrap-component.js";

/**
 * Function or Promise that loads a component module for code-splitting.
 * Supports both standard dynamic imports returning `{ default: Component }` and direct Component returns.
 *
 * @template P - Component props type
 */
export type LazyComponentLoader<P = void> =
  | (() => Promise<{ default: SeidrComponentFactoryOrFunction<P> } | SeidrComponentFactoryOrFunction<P>>)
  | Promise<{ default: SeidrComponentFactoryOrFunction<P> } | SeidrComponentFactoryOrFunction<P>>;

/**
 * Options for configuring a lazy component.
 */
export interface LazyOptions {
  /**
   * Optional fallback content to display while the component is loading.
   */
  fallback?: () => SeidrChild;

  /**
   * Optional fallback content to display if the module fails to load.
   */
  onError?: (error: Error) => SeidrChild;

  /**
   * Optional component name for debugging and SSR identification.
   * Defaults to `"LazyComponent"`.
   */
  name?: string;
}

/**
 * Lazy component factory function with preloading capabilities.
 *
 * @template P - Component props type
 */
export interface LazyComponentFactory<P = void> extends SeidrComponentFactory<P> {
  /**
   * Preloads the component module without mounting it.
   * Returns a Promise resolving to the loaded component factory or function.
   */
  preload: () => Promise<SeidrComponentFactoryOrFunction<P>>;
}

/**
 * Creates a lazy-loaded component to enable code-splitting.
 *
 * The component module is dynamically imported on first render or when `.preload()` is called.
 * Caches the resolved component for instantaneous subsequent renders.
 *
 * @template P - Component props type
 * @param {LazyComponentLoader<P>} loader - Function returning a dynamic import promise, or a promise directly
 * @param {LazyOptions} [options={}] - Optional configuration including fallback and error handling
 * @returns {LazyComponentFactory<P>} A Seidr component factory with `.preload()` method
 *
 * @example
 * ```typescript
 * // Standard dynamic import (ES module default export)
 * const AboutPage = lazy(() => import("./pages/about.js"));
 *
 * // With fallback loading indicator
 * const UserProfile = lazy(() => import("./pages/profile.js"), {
 *   fallback: () => $div({ textContent: "Loading profile..." })
 * });
 *
 * // Preload on demand (e.g. on mouse hover)
 * $a({
 *   href: "/about",
 *   textContent: "About",
 *   onmouseenter: () => AboutPage.preload()
 * });
 * ```
 */
export function lazy<P = void>(loader: LazyComponentLoader<P>, options: LazyOptions = {}): LazyComponentFactory<P> {
  const componentName = options.name || "LazyComponent";
  let resolvedComponent: SeidrComponentFactoryOrFunction<P> | undefined;
  let cachedPromise: Promise<SeidrComponentFactoryOrFunction<P>> | undefined;

  /**
   * Loads and caches the component module.
   */
  const load = (): Promise<SeidrComponentFactoryOrFunction<P>> => {
    if (resolvedComponent) {
      return Promise.resolve(resolvedComponent);
    }

    if (!cachedPromise) {
      const p = isFn(loader) ? loader() : loader;
      cachedPromise = Promise.resolve(p)
        .then((mod) => {
          const comp =
            mod && isObj(mod) && "default" in mod
              ? (mod as { default: SeidrComponentFactoryOrFunction<P> }).default
              : (mod as SeidrComponentFactoryOrFunction<P>);
          resolvedComponent = comp;
          return comp;
        })
        .catch((err) => {
          // Reset cache on failure to allow retry
          cachedPromise = undefined;
          throw wrapError(err);
        });
    }

    return cachedPromise;
  };

  const factory = createComponent<P>(
    ((props: P) => {
      const parentScope = getComponentScope();

      // Fast-path: if already resolved, render immediately and synchronously
      if (resolvedComponent) {
        const compFactory = wrapComponent<P>(resolvedComponent, componentName);
        return compFactory(props);
      }

      const currentChild = createValue<SeidrChild>(options.fallback ? options.fallback() : null, { hydrate: false });

      let isUnmounted = false;
      onUnmounted(() => {
        isUnmounted = true;
        currentChild.destroy();
      });

      const executionPromise = load()
        .then((comp) => {
          if (isUnmounted) return;

          const prevScope = getComponentScope();
          if (parentScope) {
            setComponentScope(parentScope);
          }
          try {
            const compFactory = wrapComponent<P>(comp, componentName);
            const compInstance = compFactory(props);
            currentChild(compInstance);
          } finally {
            setComponentScope(prevScope);
          }
        })
        .catch((err) => {
          if (isUnmounted) return;

          const error = wrapError(err);
          if (options.onError) {
            currentChild(options.onError(error));
          } else {
            if (process.env.NODE_ENV === "development" || process.env.VITEST) {
              console.error(`[Seidr] Failed to load lazy component "${componentName}":`, error);
            }
          }
        });

      // Register with SSR scope if rendering on server
      if (isServer()) {
        getSSRScope()?.addPromise(executionPromise);
      }

      return currentChild;
    }) as SeidrComponentFactoryPureFunction<P>,
    componentName,
  ) as LazyComponentFactory<P>;

  factory.preload = () => load();

  return factory;
}
