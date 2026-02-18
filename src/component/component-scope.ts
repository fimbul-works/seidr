import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { safe } from "../util/try-catch-finally";
import { executeInContext } from "./component-stack";
import type { ComponentScope, SeidrComponent } from "./types";

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * @param {string} id - The ID of the component
 * @returns {ComponentScope} A ComponentScope instance
 */
export const createScope = (id: string = "unknown", parent: SeidrComponent | null = null): ComponentScope => {
  const parentComponent: SeidrComponent | null = parent;
  const children = new Map<string, SeidrComponent>();
  let cleanups: CleanupFunction[] = [];
  let destroyed = false;
  let attachedParent: Node | null = null;
  let componentInstance: SeidrComponent | null = null;

  const scope: ComponentScope = {
    get id() {
      return id;
    },
    get isDestroyed() {
      return destroyed;
    },
    get parent() {
      return parentComponent;
    },
    get parentNode() {
      return attachedParent;
    },
    get children() {
      return children;
    },
    removeChild(childComponent: SeidrComponent) {
      children.delete(childComponent.id);
    },
    track(cleanup: CleanupFunction): void {
      if (destroyed) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[${id}] Tracking cleanup on already destroyed scope`);
        }
        cleanup();
        return;
      }
      cleanups.push(cleanup);
    },
    observe<T>(observable: Seidr<T>, callback: (val: T) => void): CleanupFunction {
      const observer = observable.observe((val) => {
        if (componentInstance) {
          executeInContext(componentInstance, () => callback(val));
        } else {
          callback(val);
        }
      });
      scope.track(observer);
      return observer;
    },
    waitFor<T>(promise: Promise<T>): Promise<T> {
      if (process.env.CORE_DISABLE_SSR) {
        return promise;
      }

      getRenderContext()?.onPromise?.(promise);

      return promise;
    },
    child(childComponent: SeidrComponent) {
      children.set(childComponent.id, childComponent);
      scope.track(() => childComponent.unmount());

      if (attachedParent) {
        childComponent.scope.attached(attachedParent);
      }

      return childComponent;
    },
    attached(parent: Node) {
      if (attachedParent) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[${id}] Calling attached on an already attached scope`);
        }
        return; // Already attached
      }

      attachedParent = parent;
      this.onAttached?.(parent);

      children.forEach((c) => c.scope.attached(parent));
    },
    destroy() {
      if (destroyed) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[${id}] Destroying already destroyed scope`);
        }
        return;
      }

      destroyed = true;
      cleanups.forEach((fn) => safe(fn));
      cleanups = [];
      children.clear();
      attachedParent = null;
      componentInstance = null;
    },
    // @ts-expect-error - internal usage
    _setComponent: (comp: SeidrComponent) => (componentInstance = comp),
  };

  return scope;
};

/**
 * Internal helper to link the scope to its component instance.
 */
export const setScopeComponent = (scope: ComponentScope, component: SeidrComponent) => {
  // We use a closure variable 'componentInstance' inside createScope
  // To access it from outside, we can attach a hidden method to the scope object
  // or we can just make createScope return a tuple [scope, setComponent]
  // But that changes the public API of createScope which is used in component() factory

  // Let's rely on a hidden property on the scope object that createScope defines
  (scope as any)._setComponent?.(component);
};
