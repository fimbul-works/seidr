import { encodeBase62 } from "@fimbul-works/futhark";
import { getAppState } from "../app-state/app-state.js";
import { ROOT_ATTRIBUTE, TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants.js";
import { $text } from "../dom/node/text.js";
import type { SeidrChild } from "../element/types.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { fastMix } from "../util/fast-mix.js";
import { fastMixHash } from "../util/fast-mix-hash.js";
import { str } from "../util/string.js";
import { isComponent } from "../util/type-guards/component-types.js";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types.js";
import { isArray, isEmpty, isNum, isStr } from "../util/type-guards/primitive-types.js";
import { getMarkerComments } from "./get-marker-comments.js";
import { setScope } from "./set-scope.js";
import type {
  Component,
  ComponentChildren,
  ComponentFactory,
  ComponentFactoryPureFunction,
  OnMountFunction,
} from "./types.js";
import { useScope } from "./use-scope.js";
import { getFirstNode } from "./util/get-first-node.js";

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
  const componentFactory = ((props: P, parentComponent: Component | null = null, identifier?: unknown) => {
    // Get parent component and its numeric ID
    let parentComponentNumericId: number;
    if (!parentComponent) {
      try {
        parentComponent = useScope();
      } catch {
        // Ignore if no parent component (e.g. root component), will use app state ID as parent ID for hashing
      }
    }

    const ctxID = getAppState().ctxID;
    if (parentComponent) {
      parentComponentNumericId = parentComponent.numericId;
    } else {
      parentComponentNumericId = ctxID;
    }

    /**
     * Builds a component ID from a numeric ID.
     * In production, it uses base62 encoding for short IDs.
     * In development, it includes the component name for easier debugging.
     * @param numericId - The numeric ID to encode
     * @returns The component ID string
     */
    const buildComponentId = (numericId: number): string =>
      // @ts-expect-error
      !__SEIDR_DEV__ ? encodeBase62(numericId) : `${name}-${encodeBase62(numericId)}`;

    // Determine numeric by either consuming a pre-defined component ID, or use the parent component's next child ID
    let numericId = fastMixHash(
      !isEmpty(identifier) ? identifier : parentComponent ? parentComponent.nextChildId() : 1,
      parentComponentNumericId,
    );

    let componentId = buildComponentId(numericId);

    // Handle collision by incrementing numeric hash value until a free slot is found
    while (parentComponent?.children.has(componentId)) {
      numericId = fastMix(parentComponent.nextChildId(), parentComponentNumericId);
      componentId = buildComponentId(numericId);
    }

    const onMountFns: OnMountFunction[] = [];
    const onAttachedFns: (() => void)[] = [];
    const onUnmountFns: CleanupFunction[] = [];

    const createdIndex: (ChildNode | Component)[] = [];
    const children = new Map<string, Component>();
    const childComponentNodes = new Map<Node, string>();

    let childCounter = 0;
    let seidrCounter = 0;

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
      get numericId() {
        return numericId;
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
                if (item.parentNode) {
                  item.remove();
                }

                if (isServer()) {
                  // Untrack in SSR
                  instance.untrackChild(item);
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
        if (isServer()) {
          // Unregister in SSR
          getSSRScope()?.unregisterComponent(instance);
          createdIndex.length = 0;
        }

        // Clean up resources and unmount children
        instance.cleanup();

        if (process.env.SEIDR_ENABLE_SSR && isHydrating()) {
          getHydrationContext()?.removeComponent(instance);
        }

        // Remove from DOM
        startMarkerComment?.remove();
        endMarkerComment?.remove();
        instance.element = null;

        // Always remove from parent component tracking
        parentComponent?.removeChild(instance);

        if (!parentNode) {
          if (process.env.SEIDR_DEBUG) {
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
            console.warn(`[${componentId}] Error in onAttached callback`, error);
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
            console.error(`[${componentId}] Error in onUnmount callback`, error);
          }
        });
        onUnmountFns.length = 0;
        children.clear();
      },
      nextChildId() {
        return ++childCounter;
      },
      nextSeidrId() {
        return ++seidrCounter;
      },
      addChild(childComponent: Component): Component {
        children.set(childComponent.id, childComponent);
        onUnmountFns.push(() => childComponent.unmount());
        childComponent.onUnmount(() => {
          children.delete(childComponent.id);
          if (isServer()) {
            instance.untrackChild(childComponent);
          }
        });
        if (isServer()) {
          instance.trackChild(childComponent);
        }
        return childComponent;
      },
      removeChild(childComponent: Component): void {
        children.delete(childComponent.id);
        if (isServer()) {
          instance.untrackChild(childComponent);
        }
      },
      trackChild(child: ChildNode | Component) {
        if (isServer() && createdIndex.indexOf(child) === -1) {
          createdIndex.push(child);
        }
      },
      untrackChild(child: ChildNode | Component) {
        if (isServer()) {
          const index = createdIndex.indexOf(child);
          if (index !== -1) {
            createdIndex.splice(index, 1);
          }
        }
      },
    };

    try {
      // Set as current component (Push to tree)
      setScope(instance);

      // Register component with SSR scope for hydration path mapping
      if (process.env.SEIDR_ENABLE_SSR) {
        if (isServer()) {
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
      if (process.env.SEIDR_ENABLE_SSR && isServer()) {
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
      // @ts-expect-error
      if (__SEIDR_DEV__) {
        console.error(`[${instance.id}] Error occurred`, err);
      }
      throw err;
    } finally {
      setScope(parentComponent);
      if (process.env.SEIDR_ENABLE_SSR && isHydrating()) {
        getHydrationContext()?.popComponent();
      }
    }

    if (process.env.SEIDR_ENABLE_SSR) {
      /**
       * Recursively applies the data attributes to root HTMLElements.
       * @param {ComponentChildren} item - The child to search
       */
      const applyRootAttributes = (item: ComponentChildren): void => {
        if (isHTMLElement(item)) {
          // Apply app root marker if top-level
          if (!parentComponent) {
            item.setAttribute(ROOT_ATTRIBUTE, str(ctxID));
          }
        } else if (isComponent(item)) {
          applyRootAttributes(item.element);
        } else if (isArray(item)) {
          for (const child of item) {
            applyRootAttributes(child);
          }
        }
      };

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
