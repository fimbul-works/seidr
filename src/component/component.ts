import { getAppState, getAppStateID, getNextComponentId } from "../app-state/app-state";
import { ROOT_ATTRIBUTE, TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { $text } from "../dom/node/text";
import type { SeidrChild } from "../element";
import type { Seidr } from "../seidr";
import { getHydrationContext } from "../ssr/hydrate/context/hydration-context";
import { isHydrating } from "../ssr/hydrate/storage";
import { getSSRScope } from "../ssr/ssr-scope";
import { type CleanupFunction, SeidrError } from "../types";
import { isServer } from "../util/environment/is-server";
import { str } from "../util/string";
import { isComponent } from "../util/type-guards/component-types";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isEmpty, isNum, isStr } from "../util/type-guards/primitive-types";
import { executeInContext, getCurrentComponent, pop, push } from "./component-stack";
import { getMarkerComments } from "./get-marker-comments";
import type {
  Component,
  ComponentChildren,
  ComponentFactory,
  ComponentFactoryPureFunction,
  OnMountFunction,
} from "./types";
import { getFirstNode } from "./util/get-first-node";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * @template P - Props object type (optional)
 *
 * @param {ComponentFactoryPureFunction<P>} factory - Function that accepts props and creates the component element
 * @param {string} name - The name of the component
 * @returns {ComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export const component = <P = void>(
  factory: ComponentFactoryPureFunction<P>,
  name: string = "Component",
): ComponentFactory<P> => {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props: P) => {
    const parentComponent = getCurrentComponent();
    const numericId = str(getNextComponentId());
    const componentId = `${name}-${numericId}`;
    const isSSR = !process.env.CORE_DISABLE_SSR && isServer();

    const onMountFns: OnMountFunction[] = [];
    const onAttachedFns: (() => void)[] = [];
    const onUnmountFns: CleanupFunction[] = [];

    const createdIndex: (ChildNode | Component)[] = [];
    const children = new Map<string, Component>();
    const childComponentNodes = new Map<Node, string>();

    let parentNode: ParentNode | null = null;
    let element: ComponentChildren;

    let startMarkerComment: Comment | null = null;
    let endMarkerComment: Comment | null = null;

    // Create Component instance
    const instance: Component = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT as typeof TYPE_COMPONENT;
      },
      get id() {
        return componentId;
      },
      get isMounted() {
        return !!parentNode;
      },
      get parent() {
        return parentComponent;
      },
      get element() {
        return element;
      },
      set element(val: ComponentChildren) {
        if (element === val) return;

        const next = new Set(isArray(val) ? val : [val]);

        if (element) {
          const walk = (item: ComponentChildren) => {
            if (isArray(item)) {
              item.forEach(walk);
            } else {
              if (isComponent(item) && !next.has(item)) {
                item.unmount();
              } else if (isDOMNode(item)) {
                // Remove DOM node
                const el: ChildNode = item;
                if (el.parentNode) {
                  el.remove();
                }

                if (isSSR) {
                  // Untrack in SSR
                  this.untrackChild(el);
                }
              }
            }
          };
          walk(element);
        }

        element = val;
      },
      get startMarker() {
        return startMarkerComment;
      },
      get endMarker() {
        return endMarkerComment;
      },
      get parentNode() {
        return parentNode;
      },
      get createdIndex() {
        return createdIndex;
      },
      get children() {
        return children;
      },
      get childCreatedIndex() {
        return childComponentNodes;
      },
      onMount(fn: OnMountFunction) {
        onMountFns.push(fn);
      },
      onAttached(fn: () => void) {
        // Invoke immediately if parent is already attached
        if (parentNode?.isConnected) {
          fn();
        } else {
          onAttachedFns.push(fn);
        }
      },
      onUnmount(fn: CleanupFunction): void {
        onUnmountFns.push(fn);
      },
      mount(parent: ParentNode): void {
        if (!parent) {
          throw new SeidrError("Cannot mount to null parent", { cause: instance });
        }

        if (instance.isMounted && parentNode === parent) {
          return;
        }

        parentNode = parent;
        onMountFns.forEach((cb) => {
          try {
            cb(parentNode!);
          } catch (error) {
            console.error(`[${componentId}] Error in onMount callback`, error);
          }
        });
        onMountFns.length = 0;

        if (parent.isConnected) {
          instance.attached();
        }
      },
      unmount(): void {
        if (isSSR) {
          // Unregister in SSR
          getSSRScope()?.unregisterComponent(instance);
          createdIndex.length = 0;

          const numStr = instance.id.split("-").pop();
          if (numStr) {
            getAppState().consumedIds?.add(parseInt(numStr, 10));
          }
        }

        // Clean up resources and unmount children
        instance.cleanup();

        if (!process.env.CORE_DISABLE_SSR && isHydrating()) {
          getHydrationContext()?.removeComponent(instance);
        }

        // Remove from DOM
        const startMarker = startMarkerComment;
        startMarker?.remove();

        const endMarker = endMarkerComment;
        endMarker?.remove();
        instance.element = null;

        // Always remove from parent component tracking
        parentComponent?.removeChild(instance);

        if (!parentNode) {
          if (process.env.DEBUG) {
            // console.trace(`[${componentId}] Unmounting already unmounted component`);
          } else {
            // console.warn(`[${componentId}] Unmounting already unmounted component`);
          }
          return;
        }

        // Remove from parent
        parentNode = null;
      },
      attached(): void {
        onAttachedFns.forEach((fn) => {
          try {
            fn();
          } catch (error) {
            console.warn(error);
          }
        });
        onAttachedFns.length = 0;
        children.forEach((child) => child.attached());
      },
      cleanup(): void {
        onUnmountFns.forEach((fn) => {
          try {
            fn();
          } catch (error) {
            console.warn(error);
          }
        });
        onUnmountFns.length = 0;
        children.clear();
      },
      addChild(childComponent: Component): Component {
        children.set(childComponent.id, childComponent);
        onUnmountFns.push(() => childComponent.unmount());
        childComponent.onUnmount(() => {
          children.delete(childComponent.id);
          if (isSSR) {
            instance.untrackChild(childComponent);
          }
        });
        if (isSSR) {
          instance.trackChild(childComponent);
        }
        return childComponent;
      },
      removeChild(childComponent: Component): void {
        children.delete(childComponent.id);
        if (isSSR) {
          instance.untrackChild(childComponent);
        }
      },
      observe<T>(observable: Seidr<T>, callback: (val: T) => void): CleanupFunction {
        const cleanup = observable.observe((val) => executeInContext(instance, () => callback(val)));
        instance.onUnmount(cleanup);
        return cleanup;
      },
      waitFor<T>(promise: Promise<T>): Promise<T> {
        if (process.env.CORE_DISABLE_SSR) {
          return promise;
        }
        return getSSRScope()?.addPromise(promise) || promise;
      },
      trackChild(child: ChildNode | Component) {
        if (isSSR && createdIndex.indexOf(child) === -1) {
          createdIndex.push(child);
        }
      },
      untrackChild(child: ChildNode | Component) {
        if (isSSR) {
          const index = createdIndex.indexOf(child);
          if (index !== -1) {
            createdIndex.splice(index, 1);
          }
        }
      },
    };

    try {
      // Set as current component (Push to tree)
      push(instance);

      // Register component with SSR scope for hydration path mapping
      if (!process.env.CORE_DISABLE_SSR) {
        if (isSSR) {
          getSSRScope()?.registerComponent(instance);
        } else if (isHydrating()) {
          getHydrationContext()?.pushComponent(instance);
        }
      }

      // Render the component via factory
      const result = factory(props);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): ComponentChildren => {
        if (isStr(item) || isNum(item)) {
          return $text(item);
        }
        return item;
      };

      element = isArray(result) ? (result.filter(Boolean).map(toNode) as ComponentChildren) : toNode(result);

      // Only add markers if the component returns an array, or a nullish/text value
      const shouldAddMarkerComments = isArray(element) || isEmpty(element);
      if (shouldAddMarkerComments && !startMarkerComment) {
        [startMarkerComment, endMarkerComment] = getMarkerComments(componentId)!;
      }

      // Track component boundary in parent immediately to match evaluation order
      if (!process.env.CORE_DISABLE_SSR && isServer()) {
        if (parentComponent) {
          const start = startMarkerComment || getFirstNode(instance);
          if (start) {
            parentComponent.childCreatedIndex.set(start, componentId);
          }
          if (endMarkerComment) {
            parentComponent.childCreatedIndex.set(endMarkerComment, componentId);
          }
        }
      }
    } catch (err) {
      instance.unmount();
      // Restore previous component (Pop from tree)
      if (process.env.NODE_ENV === "development") {
        console.error(instance.id, err);
      }
      throw err;
    } finally {
      pop();
      if (!process.env.CORE_DISABLE_SSR && isHydrating()) {
        getHydrationContext()?.popComponent();
      }
    }

    /**
     * Recursively applies the data attributes to root HTMLElements.
     * @param {ComponentChildren} item - The child to search
     */
    const applyRootAttributes = (item: ComponentChildren): void => {
      if (isHTMLElement(item)) {
        // Apply app root marker if top-level
        if (!parentComponent) {
          item.setAttribute(ROOT_ATTRIBUTE, str(getAppStateID()));
        }
      } else if (isComponent(item)) {
        applyRootAttributes(item.element);
      } else if (isArray(item)) {
        for (const child of item) {
          applyRootAttributes(child);
        }
      }
    };

    if (!process.env.CORE_DISABLE_SSR) {
      applyRootAttributes(element);
    }

    parentComponent?.addChild(instance);

    return instance;
  }) as ComponentFactory<P>;

  Object.defineProperties(componentFactory, {
    [TYPE_PROP]: {
      value: TYPE_COMPONENT_FACTORY,
      writable: false,
      configurable: false,
      enumerable: true,
    },
    name: {
      value: name,
      writable: false,
      configurable: false,
      enumerable: true,
    },
  });

  return componentFactory;
};
