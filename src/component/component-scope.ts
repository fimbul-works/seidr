import { getRenderContext } from "../render-context";
import type { CleanupFunction } from "../types";
import type { ComponentScope, SeidrComponent } from "./types";

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * @param {string} id - The ID of the component
 * @returns {ComponentScope} A ComponentScope instance
 */
export function createScope(id: string = "unknown"): ComponentScope {
  let cleanups: CleanupFunction[] = [];
  const children: SeidrComponent[] = [];
  let destroyed = false;
  let attachedParent: Node | null = null;

  const scope: ComponentScope = {
    get id() {
      return id;
    },
    get isDestroyed() {
      return destroyed;
    },
    track(cleanup: CleanupFunction): void {
      if (destroyed) {
        console.warn(`[${id}] Tracking cleanup on already destroyed scope`);
        cleanup();
        return;
      }
      cleanups.push(cleanup);
    },
    waitFor<T>(promise: Promise<T>): Promise<T> {
      const ctx = getRenderContext();
      if (ctx?.onPromise) {
        ctx.onPromise(promise);
      }
      return promise;
    },
    child(c: SeidrComponent) {
      children.push(c);
      scope.track(() => c.unmount());

      if (attachedParent) {
        c.scope.attached(attachedParent);
      }

      return c;
    },
    attached(parent: Node) {
      if (attachedParent) {
        return; // Already attached
      }
      attachedParent = parent;

      if (scope.onAttached) {
        scope.onAttached(parent);
      }

      children.forEach((c) => {
        c.scope.attached(parent);
      });
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error(error);
        }
      });
      cleanups = [];
      children.length = 0;
      attachedParent = null;
    },
    onAttached: undefined,
  };

  return scope;
}
