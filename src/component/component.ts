import { getAppStateID, getNextComponentId } from "../app-state/app-state";
import {
  HYDRATION_ID_ATTRIBUTE,
  ROOT_ATTRIBUTE,
  TAG_COMMENT,
  TYPE_COMPONENT,
  TYPE_COMPONENT_FACTORY,
  TYPE_PROP,
} from "../constants";
import { $text } from "../dom/node/text";
import type { SeidrChild } from "../element";
import type { Seidr } from "../seidr";
import {
  getRootsForHydration,
  HydrationContext,
  popHydrationContext,
  pushHydrationContext,
} from "../ssr/hydrate/hydration-context";
import { getHydrationData, getHydrationMap, isHydrating } from "../ssr/hydrate/storage";
import { getSSRScope } from "../ssr/ssr-scope";
import type { CleanupFunction } from "../types";
import { isServer } from "../util/environment/is-server";
import { str } from "../util/string";
import { isComponent } from "../util/type-guards/component-types";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isEmpty, isNum, isStr } from "../util/type-guards/primitive-types";
import { executeInContext, getCurrentComponent, pop, push } from "./component-stack";
import { getMarkerComments } from "./get-marker-comments";
import type { Component, ComponentChildren, ComponentFactory, ComponentFactoryPureFunction } from "./types";
import { getFirstNode } from "./util/component-nodes";

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
    const parent = getCurrentComponent();
    const componentId = str(getNextComponentId());
    const fullComponentId = `${name}-${componentId}`;
    const shouldCapture = isServer();

    // Lifecycle state
    const children = new Map<string, Component>();
    let cleanups: CleanupFunction[] = [];
    let mountCallbacks: ((parent: Node) => void)[] = [];
    let destroyed = false;
    let attachedParent: Node | null = null;
    const trackedNodes: Node[] = [];
    const childComponentNodes = new Map<Node, string>();

    // Create Component instance
    const comp = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT;
      },
      get id() {
        return fullComponentId;
      },
      get isUnmounted() {
        return destroyed;
      },
      get parent() {
        return parent;
      },
      get parentNode() {
        return attachedParent;
      },
      get indexedNodes() {
        return trackedNodes;
      },
      get childComponentNodes() {
        return childComponentNodes;
      },
      trackNode(node: Node) {
        if (process.env.DEBUG_HYDRATION) {
          console.log(
            `[${fullComponentId}] tracking node:`,
            node.nodeName,
            node.nodeType === 3 ? `"${node.textContent}"` : "",
          );
        }
        trackedNodes.push(node);
      },
      onUnmount(cleanup: CleanupFunction): void {
        if (destroyed) {
          if (process.env.DEBUG) {
            console.warn(`[${fullComponentId}] Tracking cleanup on already destroyed component`);
          }
          return cleanup();
        }
        cleanups.push(cleanup);
      },
      observe<T>(observable: Seidr<T>, callback: (val: T) => void): CleanupFunction {
        const cleanup = observable.observe((val) => executeInContext(comp, () => callback(val)));
        comp.onUnmount(cleanup);
        return cleanup;
      },
      waitFor<T>(promise: Promise<T>): Promise<T> {
        if (process.env.CORE_DISABLE_SSR) {
          return promise;
        }

        getSSRScope()?.addPromise(promise);

        return promise;
      },
      child(childComponent: Component) {
        children.set(childComponent.id, childComponent);
        childComponent.onUnmount(() => children.delete(childComponent.id));
        comp.onUnmount(() => !childComponent.isUnmounted && childComponent.unmount());

        if (attachedParent) {
          childComponent.attached(attachedParent);
        }

        return childComponent;
      },
      onMount(callback: (parent: Node) => void) {
        if (attachedParent) {
          callback(attachedParent);
        } else {
          mountCallbacks.push(callback);
        }
      },
      attached(parent: Node) {
        if (attachedParent) {
          if (process.env.DEBUG) {
            console.warn(`[${fullComponentId}] Calling attached on an already attached component`);
          }
          return; // Already attached
        }

        if (!process.env.CORE_DISABLE_SSR && shouldCapture) {
          getSSRScope()?.registerComponent(comp);
        }

        attachedParent = parent;
        mountCallbacks.forEach((cb) => cb(parent));
        mountCallbacks = [];

        children.forEach((c) => !c.parentNode && c.attached(parent));
      },
      removeChild(childComponent: Component) {
        children.delete(childComponent.id);
      },
      reset() {
        cleanups.forEach((fn) => {
          try {
            fn();
          } catch (error) {
            console.warn(error);
          }
        });
        cleanups = [];
        children.clear();
      },
      unmount() {
        if (destroyed) {
          if (process.env.DEBUG) {
            console.warn(`[${fullComponentId}] Unmounting already unmounted component`);
          }
          return;
        }

        destroyed = true;

        // 1. Run cleanups and clear children
        comp.reset();
        attachedParent = null;

        // 2. Remove from parent
        parent?.removeChild(comp);

        // 3. Remove from DOM
        const mappedStart = comp.startMarker
          ? (!process.env.CORE_DISABLE_SSR && getHydrationMap().get(comp.startMarker)) || comp.startMarker
          : undefined;

        (mappedStart as Comment)?.remove();

        const removeChildEntry = (child: ComponentChildren): void => {
          if (isComponent(child)) {
            child.unmount();
          } else if (isDOMNode(child)) {
            const mapped = (!process.env.CORE_DISABLE_SSR && getHydrationMap().get(child)) || child;

            (mapped as Element).remove();
          }
        };

        const el = comp.element;
        if (isArray(el)) {
          el.forEach(removeChildEntry);
        } else {
          removeChildEntry(el);
        }

        const mappedEnd = comp.endMarker
          ? (!process.env.CORE_DISABLE_SSR && getHydrationMap().get(comp.endMarker)) || comp.endMarker
          : undefined;
        (mappedEnd as Comment)?.remove();
      },
    } as Component;

    // Set as current component (Push to tree)
    push(comp);

    // Register component with SSR scope for hydration path mapping
    if (!process.env.CORE_DISABLE_SSR && shouldCapture) {
      getSSRScope()?.registerComponent(comp);
    }

    try {
      // Create HydrationContext if hydrating
      let hCtx: HydrationContext | null = null;
      if (!process.env.CORE_DISABLE_SSR && isHydrating()) {
        const hData = getHydrationData()!;
        const compMap = hData.data?.components?.[fullComponentId];
        if (compMap) {
          if (process.env.DEBUG_HYDRATION) console.log(`[Hydration] Hydrating component: ${fullComponentId}`);
          if (process.env.DEBUG_HYDRATION) console.log(`[Hydration] Attempting to find roots for ${fullComponentId}`);
          const roots = getRootsForHydration(fullComponentId, hData.data?.root as HTMLElement);
          if (roots.length > 0) {
            if (process.env.DEBUG_HYDRATION)
              console.log(`[Hydration] Found ${roots.length} roots for ${fullComponentId}`);
            hCtx = new HydrationContext(fullComponentId, compMap, roots);
            pushHydrationContext(hCtx);
            // If the component has markers (e.g. it's a fragment), claim the start marker
            if (compMap[0]?.[0]?.startsWith(TAG_COMMENT)) {
              hCtx.claim(compMap[0][0]);
            }
          } else {
            console.warn(
              `[Hydration] Could not find hydration roots for component ${fullComponentId}. Proceeding with client-side render only.`,
            );
          }
        }
      }

      // Render the component via factory
      const result = factory(props);

      if (!process.env.CORE_DISABLE_SSR && hCtx) {
        popHydrationContext();
      }

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): ComponentChildren => {
        if (isStr(item) || isNum(item)) {
          return $text(item);
        }
        return item;
      };

      const filterEmptyText = (item: ComponentChildren): boolean => {
        if (!item) return false;
        if ((item as Node).nodeType === 3 && !(item as Node).textContent?.trim()) return false;
        return true;
      };

      const element = isArray(result)
        ? (result.map(toNode).filter(filterEmptyText) as ComponentChildren)
        : toNode(result);

      comp.element = element;

      // Only add markers if the component returns an array, a nullish/text value, or another component.
      // This ensures pass-through components are correctly tracked in the parent's structure map,
      // providing a stable boundary even if the child subtree is dynamic (e.g. Suspense).
      const shouldAddMarkerComments = isArray(comp.element) || isEmpty(comp.element) || isComponent(comp.element);

      if (shouldAddMarkerComments && !comp.startMarker) {
        const [startMarker, endMarker] = getMarkerComments(fullComponentId);
        comp.startMarker = startMarker;
        comp.endMarker = endMarker;
      }

      // Track component boundary in parent immediately to match evaluation order
      if (!process.env.CORE_DISABLE_SSR && isServer()) {
        if (parent) {
          const boundary = comp.startMarker || getFirstNode(comp);
          if (boundary) {
            parent.trackNode(boundary);
            parent.childComponentNodes.set(boundary, comp.id);
          }
        }
      }
    } catch (err) {
      // Restore previous component (Pop from tree)
      comp.unmount();
      throw err;
    } finally {
      pop();
    }

    /**
     * Recursively applies the data attributes to root HTMLElements.
     * @param {ComponentChildren} item - The child to search
     */
    const applyRootAttributes = (item: ComponentChildren): void => {
      if (isHTMLElement(item)) {
        // Apply app root marker if top-level
        if (!parent) {
          item.setAttribute(ROOT_ATTRIBUTE, str(getAppStateID()));
        }

        // Apply component ID marker for hydration discovery
        if (!item.hasAttribute(HYDRATION_ID_ATTRIBUTE)) {
          item.setAttribute(HYDRATION_ID_ATTRIBUTE, componentId);
        }
      } else if (isComponent(item)) {
        applyRootAttributes(item.element);
      } else if (isArray(item)) {
        for (const child of item) {
          applyRootAttributes(child);
          // Only mark the first one found in the array to avoid multiple roots
          const firstMarked =
            isHTMLElement(child) ||
            (isComponent(child) && !!(child.element as HTMLElement)?.getAttribute?.(HYDRATION_ID_ATTRIBUTE));
          if (firstMarked) break;
        }
      }
    };

    if (!process.env.CORE_DISABLE_SSR) {
      applyRootAttributes(comp.element);
    }

    // Register as child component after factory runs to ensure onMount handlers are set
    parent?.child(comp);

    return comp;
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
