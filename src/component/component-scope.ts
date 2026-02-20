import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import { type CleanupFunction, SeidrError } from "../types";
import { safe } from "../util/safe";
import { executeInContext } from "./component-stack";
import type { Component, ComponentScope } from "./types";

/**
 * Creates a new ComponentScope instance for tracking component cleanup logic.
 *
 * @param {string} id - The ID of the component
 * @returns {ComponentScope} A ComponentScope instance
 */
export const createScope = (id: string = "unknown", parent: Component | null = null): ComponentScope => {
  const parentComponent: Component | null = parent;
  const children = new Map<string, Component>();
  let cleanups: CleanupFunction[] = [];
  let destroyed = false;
  let attachedParent: Node | null = null;
  let componentInstance: Component | null = null;

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
    get component() {
      return componentInstance as Component;
    },
    set component(comp: Component) {
      if (componentInstance) {
        throw new SeidrError("Component already attached");
      }
      componentInstance = comp;
    },
    removeChild(childComponent: Component) {
      children.delete(childComponent.id);
    },
    track(cleanup: CleanupFunction): void {
      if (destroyed) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[${id}] Tracking cleanup on already destroyed scope`);
        }
        return cleanup();
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
    child(childComponent: Component) {
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
  };

  return scope;
};
