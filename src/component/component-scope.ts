import type { CleanupFunction } from "src/types";
import { getRenderContext } from "../render-context";
import type { ComponentScope, SeidrComponent } from "./types";

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * ComponentScope instances are typically created internally by the component()
 * function, but can also be created directly for advanced use cases or testing.
 *
 * @returns {ComponentScope} A new ComponentScope instance with cleanup tracking capabilities
 */
export function createScope(): ComponentScope {
  let cleanups: CleanupFunction[] = [];
  let destroyed = false;

  function track(cleanup: CleanupFunction): void {
    if (destroyed) {
      console.warn("Tracking cleanup on already destroyed scope");
      cleanup();
      return;
    }
    cleanups.push(cleanup);
  }

  function waitFor<T>(promise: Promise<T>): Promise<T> {
    // Use the RenderContext to track promises, allowing for SSR waiting without global state
    const ctx = getRenderContext();
    if (ctx?.onPromise) {
      ctx.onPromise(promise);
    }
    return promise;
  }

  function child(component: SeidrComponent): SeidrComponent {
    track(() => component.destroy());
    return component;
  }

  function destroy() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error(error);
      }
    });
    cleanups = [];
  }

  return {
    get isDestroyed() {
      return destroyed;
    },
    track,
    waitFor,
    child,
    destroy,
    onAttached: undefined,
  };
}
