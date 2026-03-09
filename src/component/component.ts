import { getAppStateID, getNextComponentId } from "../app-state/app-state";
import { ROOT_ATTRIBUTE, TAG_COMMENT, TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
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
    const shouldCapture = isServer();

    const nodes: Node[] = [];
    const children = new Map<string, Component>();
    const childComponentNodes = new Map<Node, string>();

    let parentNode: Node | null = null;
    let element: ComponentChildren;
    let startMarkerComment: Comment | null = null;
    let endMarkerComment: Comment | null = null;
    const onMountCallbacks: OnMountFunction[] = [];
    const onUnmountCallbacks: CleanupFunction[] = [];

    // Create Component instance
    const instance = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT;
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
      get startMarker() {
        return startMarkerComment;
      },
      get endMarker() {
        return endMarkerComment;
      },
      get parentNode() {
        return parentNode;
      },
      get nodes() {
        return nodes;
      },
      get childComponentNodes() {
        return childComponentNodes;
      },
      onMount(callback: (parent: Node) => void) {
        onMountCallbacks.push(callback);
      },
      onUnmount(cleanup: CleanupFunction): void {
        onUnmountCallbacks.push(cleanup);
      },
      mount(parent: Element): void {
        if (parentNode) {
          if (process.env.DEBUG || process.env.VITEST) {
            console.trace(`[${componentId}] Mounting an already mounted component`);
          } else {
            console.warn(`[${componentId}] Mounting an already mounted component`);
          }
          return;
        }

        console.log("Mounting component", componentId);

        if (!process.env.CORE_DISABLE_SSR && shouldCapture) {
          getSSRScope()?.registerComponent(instance);
        }

        parentNode = parent;
        onMountCallbacks.forEach((cb) => {
          try {
            cb(parent);
          } catch (error) {
            console.error(`[${componentId}] Error in onMount callback`, error);
          }
        });
        onMountCallbacks.length = 0;

        children.forEach((c) => c.mount(parent));
      },
      unmount(): void {
        if (!parentNode) {
          if (process.env.DEBUG) {
            console.trace(`[${componentId}] Unmounting already unmounted component`);
          } else {
            console.warn(`[${componentId}] Unmounting already unmounted component`);
          }
          return;
        }

        console.log("Unmounting component", componentId);

        if (!process.env.CORE_DISABLE_SSR && shouldCapture) {
          getSSRScope()?.unregisterComponent(instance);
        }

        // Clean up resources
        instance.cleanup();

        // Remove from parent
        parentNode = null;
        parentComponent?.removeChild(instance);

        // Remove from DOM
        const startMarker = startMarkerComment
          ? (!process.env.CORE_DISABLE_SSR && (getHydrationMap().get(startMarkerComment) as Comment)) ||
            startMarkerComment
          : null;
        startMarker?.remove();

        const removeChildEntry = (child: ComponentChildren): void => {
          if (isComponent(child) && child.isMounted) {
            child.unmount();
          } else if (isDOMNode(child)) {
            const el = (!process.env.CORE_DISABLE_SSR && (getHydrationMap().get(child) as Element)) || child;
            el.remove();
            console.log("removing", (el as Element).tagName, (el as Element).className);
          }
        };

        if (isArray(element)) {
          element.forEach(removeChildEntry);
        } else {
          removeChildEntry(element);
        }

        const endMarker = endMarkerComment
          ? (!process.env.CORE_DISABLE_SSR && (getHydrationMap().get(endMarkerComment) as Comment)) || endMarkerComment
          : null;
        endMarker?.remove();
      },
      cleanup(): void {
        // Clean up callbacks
        onUnmountCallbacks.forEach((fn) => {
          try {
            fn();
          } catch (error) {
            console.warn(error);
          }
        });
        onUnmountCallbacks.length = 0;
        children.clear();
      },
      addChild(childComponent: Component): Component {
        children.set(childComponent.id, childComponent);
        childComponent.onUnmount(() => children.delete(childComponent.id));

        onUnmountCallbacks.push(() => childComponent.unmount());

        return childComponent;
      },
      removeChild(childComponent: Component): void {
        children.delete(childComponent.id);
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
      trackNode(node: Node) {
        nodes.push(node);
      },
    } as Component;

    // Set as current component (Push to tree)
    push(instance);

    // Register component with SSR scope for hydration path mapping
    if (!process.env.CORE_DISABLE_SSR && shouldCapture) {
      getSSRScope()?.registerComponent(instance);
    }

    try {
      // Create HydrationContext if hydrating
      let hydrationContext: HydrationContext | null = null;
      if (!process.env.CORE_DISABLE_SSR && isHydrating()) {
        const hydrationData = getHydrationData()!;
        const compMap = hydrationData.data?.components?.[componentId];
        if (compMap) {
          const roots = getRootsForHydration(componentId, hydrationData.data?.root as HTMLElement);
          if (roots.length > 0) {
            hydrationContext = new HydrationContext(componentId, compMap, roots);
            pushHydrationContext(hydrationContext);
            // If the component has markers (e.g. it's a fragment), claim the start marker
            if (compMap[0]?.[0]?.startsWith(TAG_COMMENT)) {
              hydrationContext.claim(compMap[0][0]);
            }
          } else {
            console.warn(
              `[Hydration] Could not find hydration roots for component ${componentId}. Proceeding with client-side render only.`,
            );
          }
        }
      }

      // Render the component via factory
      const result = factory(props);

      if (!process.env.CORE_DISABLE_SSR && hydrationContext) {
        popHydrationContext();
      }

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
        [startMarkerComment, endMarkerComment] = getMarkerComments(componentId);
      }

      // Track component boundary in parent immediately to match evaluation order
      if (!process.env.CORE_DISABLE_SSR && isServer()) {
        if (parentComponent) {
          const boundary = startMarkerComment || getFirstNode(instance);
          if (boundary) {
            parentComponent.trackNode(boundary);
            parentComponent.childComponentNodes.set(boundary, componentId);
          }
        }
      }
    } catch (err) {
      // Restore previous component (Pop from tree)
      instance.unmount();
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
