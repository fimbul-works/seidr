import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { $text } from "../dom/node/text";
import type { SeidrChild } from "../element";
import { getFeature } from "../render-context/feature";
import { getNextComponentId, getRenderContext, getRenderContextID } from "../render-context/render-context";
import type { Seidr } from "../seidr";
import { getHydrationData } from "../ssr/hydrate/get-hydration-data";
import { hasHydrationData } from "../ssr/hydrate/has-hydration-data";
import {
  getRootsForHydration,
  HydrationContext,
  popHydrationContext,
  pushHydrationContext,
} from "../ssr/hydrate/hydration-context";
import { hydrationMap } from "../ssr/hydrate/node-map";
import { getSSRScope } from "../ssr/ssr-scope";
import type { CleanupFunction } from "../types";
import { isServer } from "../util/environment/server";
import { str } from "../util/string";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isNum, isStr } from "../util/type-guards/primitive-types";
import { isComponent } from "../util/type-guards/seidr-dom-types";
import { executeInContext, getCurrentComponent, pop, push } from "./component-stack";
import { getOnPromiseFeature } from "./feature";
import { getMarkerComments } from "./get-marker-comments";
import type { Component, ComponentChildren, ComponentFactory, ComponentFactoryPureFunction } from "./types";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * @template P - Props object type (optional)
 *
 * @param {ComponentFactoryPureFunction<P>} factory - Function that accepts props and creates the component element
 * @returns {ComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export const component = <P = void>(
  factory: ComponentFactoryPureFunction<P>,
  name: string = "Component",
): ComponentFactory<P> => {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props: P) => {
    const parent = getCurrentComponent();
    const componentName = name || factory.name || "Component";
    const componentId = getNextComponentId();
    const fullComponentId =
      process.env.NODE_ENV !== "production" ? `${componentName}-${componentId}` : `${componentId}`;

    // Lifecycle state
    const children = new Map<string, Component>();
    let cleanups: CleanupFunction[] = [];
    let mountCallbacks: ((parent: Node) => void)[] = [];
    let destroyed = false;
    let attachedParent: Node | null = null;
    const trackedNodes: Node[] = [];

    // Check for hydration
    let hydrationContext: HydrationContext | null = null;
    if (!process.env.CORE_DISABLE_SSR && hasHydrationData()) {
      const hData = getHydrationData();
      if (hData?.components[fullComponentId]) {
        const roots = getRootsForHydration(fullComponentId, hData.root as HTMLElement);
        if (roots.length > 0) {
          hydrationContext = new HydrationContext(fullComponentId, hData.components[fullComponentId], roots);
          pushHydrationContext(hydrationContext);
        } else if (process.env.NODE_ENV !== "production") {
          console.warn(`[Hydration mismatch] No roots found for component ${fullComponentId}`);
        }
      }
    }

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
      trackNode(node: Node) {
        trackedNodes.push(node);
      },
      onUnmount(cleanup: CleanupFunction): void {
        if (destroyed) {
          if (process.env.NODE_ENV !== "production") {
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

        getFeature(getOnPromiseFeature(), getRenderContext())?.(promise);

        return promise;
      },
      child(childComponent: Component) {
        children.set(childComponent.id, childComponent);
        childComponent.onUnmount(() => children.delete(childComponent.id));
        comp.onUnmount(() => !childComponent.isUnmounted && childComponent.unmount());

        if (attachedParent) {
          childComponent.attached(attachedParent);
        }

        if (!process.env.CORE_DISABLE_SSR && comp.trackNode) {
          // If the child has a dedicated start marker (e.g. #component:ID or List marker), tracking it is enough for the boundary.
          if (childComponent.startMarker) {
            comp.trackNode(childComponent.startMarker);
          } else {
            // Otherwise, track its root element to signify its placement if it's a single node
            const el = isArray(childComponent.element) ? childComponent.element[0] : childComponent.element;
            if (isDOMNode(el)) {
              // Ensure we enforce the seidr-id attribute so getComponentBoundaryId catches it
              if (isHTMLElement(el)) {
                // Use only the numeric part of the ID for the attribute to match getComponentBoundaryId expectations
                const numericId = childComponent.id.split("-").pop();
                el.setAttribute("data-seidr-id", numericId || "");
              }
              comp.trackNode(el);
            }
          }
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
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[${fullComponentId}] Calling attached on an already attached component`);
          }
          return; // Already attached
        }

        if (!process.env.CORE_DISABLE_SSR && isServer()) {
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
          if (process.env.NODE_ENV !== "production") {
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
          ? (!process.env.CORE_DISABLE_SSR && hydrationMap.get(comp.startMarker)) || comp.startMarker
          : undefined;
        (mappedStart as Comment)?.remove();

        const removeChildEntry = (child: ComponentChildren): void => {
          if (isComponent(child)) {
            child.unmount();
          } else if (isDOMNode(child)) {
            (((!process.env.CORE_DISABLE_SSR && hydrationMap.get(child)) || child) as Element).remove();
          }
        };

        const el = comp.element;
        if (isArray(el)) {
          el.forEach(removeChildEntry);
        } else {
          removeChildEntry(el);
        }

        const mappedEnd = comp.endMarker
          ? (!process.env.CORE_DISABLE_SSR && hydrationMap.get(comp.endMarker)) || comp.endMarker
          : undefined;
        (mappedEnd as Comment)?.remove();
      },
    } as Component;

    // Set as current component (Push to tree)
    push(comp);

    // Register component with SSR scope for hydration path mapping
    if (!process.env.CORE_DISABLE_SSR && isServer()) {
      getSSRScope()?.registerComponent(comp);
    }

    try {
      // Render the component via factory
      const result = factory(props);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): ComponentChildren => (isStr(item) || isNum(item) ? $text(item) : item);
      const element = isArray(result) ? (result.map(toNode).filter(Boolean) as ComponentChildren) : toNode(result);

      // Apply component id to all root elements
      if (!process.env.CORE_DISABLE_SSR) {
        [...(isArray(element) ? element : [element])].forEach((el) => {
          if (isHTMLElement(el)) {
            el.setAttribute("data-seidr-id", str(componentId));
          }
        });
      }

      comp.element = element;

      // Only add markers if the component returns an array or a nullish/text value.
      const shouldAddMarkerComments =
        getRenderContext().markers.has(fullComponentId) ||
        isArray(comp.element) ||
        (!isHTMLElement(comp.element) && !isComponent(comp.element));

      if (shouldAddMarkerComments) {
        const [startMarker, endMarker] = getMarkerComments(fullComponentId);
        comp.startMarker = startMarker;
        comp.endMarker = endMarker;

        // In SSR, track the start marker first
        if (!process.env.CORE_DISABLE_SSR && isServer()) {
          console.log(`[SSR] [${fullComponentId}] Tracking start marker: <!--${comp.startMarker.textContent}-->`);
          comp.trackNode(comp.startMarker);
        } else if (!process.env.CORE_DISABLE_SSR && hydrationContext) {
          // In hydration, claim the start marker
          const claimed = hydrationContext.claim();
          console.log(
            `[Hydration debug] [${fullComponentId}] Claiming start marker: <!--${comp.startMarker.textContent}--> -> ${claimed ? "FOUND" : "NOT FOUND"}`,
          );
          if (claimed) {
            hydrationMap.set(comp.startMarker, claimed);
          }
        }
      }

      // Re-evaluate final marker needs
      const finalShouldAddMarkerComments =
        getRenderContext().markers.has(fullComponentId) ||
        isArray(element) ||
        (!isHTMLElement(element) && !isComponent(element));

      if (finalShouldAddMarkerComments && comp.endMarker) {
        // Track/claim the end marker at the end of the sequence
        if (!process.env.CORE_DISABLE_SSR && isServer()) {
          console.log(`[SSR] [${fullComponentId}] Tracking end marker: <!--${comp.endMarker.textContent}-->`);
          comp.trackNode(comp.endMarker);
        } else if (!process.env.CORE_DISABLE_SSR && hydrationContext) {
          const claimed = hydrationContext.claim();
          console.log(
            `[Hydration debug] [${fullComponentId}] Claiming end marker: <!--${comp.endMarker.textContent}--> -> ${claimed ? "FOUND" : "NOT FOUND"}`,
          );
          if (claimed) {
            hydrationMap.set(comp.endMarker, claimed);
          }
        }
      }
    } catch (err) {
      // Restore previous component (Pop from tree)
      comp.unmount();
      throw err;
    } finally {
      if (!process.env.CORE_DISABLE_SSR && hydrationContext) {
        popHydrationContext();
      }
      pop();
    }

    // Apply root element attributes
    if (!parent && !process.env.CORE_DISABLE_SSR) {
      /**
       * Recursively applies the seidrRoot dataset attribute to the first HTMLElement found.
       * @param {ComponentChildren} item - The child to search
       */
      const applyRootMarker = (item: ComponentChildren): void => {
        if (isHTMLElement(item)) {
          item.dataset.seidrRoot = str(getRenderContextID());
        } else if (isComponent(item)) {
          applyRootMarker(item.element);
        } else if (isArray(item)) {
          for (const child of item) {
            applyRootMarker(child);
            // Only mark the first one found in the array to avoid multiple roots
            const firstMarked =
              isHTMLElement(child) || (isComponent(child) && !!(child.element as HTMLElement)?.dataset?.seidrRoot);
            if (firstMarked) break;
          }
        }
      };

      applyRootMarker(comp.element);
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
