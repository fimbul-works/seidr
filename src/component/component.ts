import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { $text } from "../dom/node/text";
import type { SeidrChild } from "../element";
import { getRenderContext } from "../render-context";
import { getFeature } from "../render-context/feature";
import { getNextComponentId } from "../render-context/get-next-id";
import { getRenderContextID } from "../render-context/render-context";
import type { Seidr } from "../seidr";
import { hydrationMap } from "../ssr/hydrate/node-map";
import type { CleanupFunction } from "../types";
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
    const id = `${name}-${getNextComponentId()}`;

    // Lifecycle state
    const children = new Map<string, Component>();
    let cleanups: CleanupFunction[] = [];
    let destroyed = false;
    let attachedParent: Node | null = null;

    // Create Component instance
    const comp = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT;
      },
      get id() {
        return id;
      },
      get isDestroyed() {
        return destroyed;
      },
      get parent() {
        return parent;
      },
      get parentNode() {
        return attachedParent;
      },
      track(cleanup: CleanupFunction): void {
        if (destroyed) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[${id}] Tracking cleanup on already destroyed component`);
          }
          return cleanup();
        }
        cleanups.push(cleanup);
      },
      observe<T>(observable: Seidr<T>, callback: (val: T) => void): CleanupFunction {
        const cleanup = observable.observe((val) => executeInContext(comp, () => callback(val)));
        comp.track(cleanup);
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
        comp.track(() => childComponent.unmount());

        if (attachedParent) {
          childComponent.attached(attachedParent);
        }

        return childComponent;
      },
      attached(parent: Node) {
        if (attachedParent) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[${id}] Calling attached on an already attached component`);
          }
          return; // Already attached
        }

        attachedParent = parent;
        comp.onAttached?.(parent);

        children.forEach((c) => c.attached(parent));
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
          if (process.env.NODE_ENV === "development") {
            console.warn(`[${id}] Unmounting already unmounted component`);
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

    try {
      // Render the component via factory
      const result = factory(props);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): ComponentChildren => (isStr(item) || isNum(item) ? $text(item) : item);

      const element = isArray(result) ? (result.map(toNode).filter(Boolean) as ComponentChildren) : toNode(result);
      comp.element = element;

      // Only add markers if the component returns an array or a nullish/text value.
      // If it's a single HTMLElement or Component, we skip markers to reduce SSR bloat.
      // We also check if markers were explicitly requested (e.g. by Switch or List).
      const shouldAddMarkers =
        getRenderContext().markers.has(id) || isArray(element) || (!isHTMLElement(element) && !isComponent(element));

      if (shouldAddMarkers) {
        const [startMarker, endMarker] = getMarkerComments(id);
        comp.startMarker = startMarker;
        comp.endMarker = endMarker;
      }
    } catch (err) {
      // Restore previous component (Pop from tree)
      comp.unmount();
      throw err;
    } finally {
      pop();
    }

    // Apply root element attributes
    if (!parent) {
      /**
       * Recursively applies the seidrRoot dataset attribute to the first HTMLElement found.
       * @param {ComponentChildren} item - The child to search
       */
      const applyRootMarker = (item: ComponentChildren): void => {
        if (isHTMLElement(item)) {
          item.dataset.seidrRoot = String(getRenderContextID());
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

    // Register as child component after factory runs to ensure onAttached handlers are set
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
