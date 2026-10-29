import { fastMix } from "@fimbul-works/hash";
import { isArray, isBool, isNullish, isNum, isStr } from "@fimbul-works/hvat";
import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants.js";
import { createReactiveValueNodes } from "../dom/append-child.js";
import { $text } from "../dom/node/text.js";
import type { SeidrChild } from "../element/types.js";
import { isValue } from "../observable/type-guards.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import type { CleanupFunction } from "../types.js";
import { defineValueProp } from "../util/define-prop.js";
import { isServer } from "../util/environment/is-server.js";
import { fastHash } from "../util/fast-hash.js";
import { getComponentRegitry } from "./component-registry.js";
import { getComponentScope, setComponentScope } from "./component-scope.js";
import { isComponent } from "./type-guards.js";
import type {
  OnMountedFunction,
  SeidrComponent,
  SeidrComponentFactory,
  SeidrComponentFactoryPureFunction,
} from "./types.js";
import { setComponentNodes } from "./util/set-component-nodes.js";
import { unsetComponentNodes } from "./util/unset-component-nodes.js";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * @template P - Props object type (optional)
 *
 * @param {SeidrComponentFactoryPureFunction<P>} factory - Function that accepts props and creates the component element
 * @param {string} name - The name of the component
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export function createComponent<P = void>(
  factory: SeidrComponentFactoryPureFunction<P>,
  name: string = "Component",
): SeidrComponentFactory<P> {
  const componentFactory = ((props: P, identifier?: unknown) => {
    const parentComponent = getComponentScope();
    const registry = getComponentRegitry();

    // Determine unique ID
    const idSet = new Set(registry.values().map((c) => c.id));
    let idCounter = idSet.size;
    let id = fastHash(!isNullish(identifier) ? identifier : (parentComponent?.id ?? idCounter));
    while (idSet.has(id)) {
      id = fastMix(++idCounter, id);
    }

    // Component mounted status
    let isMounted: boolean = false;

    // Child components
    const children = new Set<SeidrComponent>();

    // Lifecycle callbacks
    const componentMountedFns: OnMountedFunction[] = [];
    const componentUnmountedFns: CleanupFunction[] = [];

    // Running counter for Value IDs
    let valueIdCounter = 1;

    // Create component instance
    const currentComponent = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT as typeof TYPE_COMPONENT;
      },
      get id() {
        return id;
      },
      get name() {
        return name;
      },
      get isMounted() {
        return isMounted;
      },
      nodes: [],
      get children() {
        return children;
      },
      addChild: (child: SeidrComponent) => {
        children.add(child);
        child.parent = currentComponent;
        if (isMounted && (child.nodes.length === 0 || child.nodes.some((n) => n.isConnected))) {
          child.mount();
        }
        if (isServer()) {
          currentComponent.trackChild?.(child);
        }
      },
      removeChild: (child: SeidrComponent) => {
        child.parent = null;
        children.delete(child);
        if (isServer()) {
          currentComponent.untrackChild?.(child);
        }
      },
      parent: parentComponent,
      mount() {
        if (isMounted) return;
        isMounted = true;
        registry.add(currentComponent);

        // Set current component as active
        const prev = getComponentScope();
        setComponentScope(currentComponent);

        // Trigger onMounted callbacks on client-side
        componentMountedFns.forEach((fn) => fn());

        // Restore cursor
        setComponentScope(prev);

        children.forEach((child) => child.mount());
      },
      onMounted: (fn: OnMountedFunction) => componentMountedFns.push(fn),
      onUnmounted: (fn: CleanupFunction) => componentUnmountedFns.push(fn),
      unmount(): void {
        if (isServer()) {
          getSSRScope()?.unregisterComponent(currentComponent);
          if (isArray(currentComponent.createdIndex)) {
            currentComponent.createdIndex.length = 0;
          }
          currentComponent.parent?.untrackChild?.(currentComponent);
        }

        if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
          getHydrationContext()?.removeComponent(currentComponent);
        }

        registry.delete(currentComponent);
        currentComponent.parent?.removeChild(currentComponent);

        componentUnmountedFns.forEach((fn) => fn());

        children.forEach((c) => c.unmount());

        unsetComponentNodes(currentComponent);
        isMounted = false;
      },
      get nextValueId() {
        return valueIdCounter++;
      },
    } as unknown as SeidrComponent;

    // Add SSR child tracking functionality
    if (isServer()) {
      currentComponent.createdIndex = [];
      currentComponent.childCreatedIndex = new Map<Node | SeidrComponent, string>();

      currentComponent.trackChild = (child: ChildNode | SeidrComponent) =>
        isServer() && currentComponent.createdIndex.indexOf(child) === -1 && currentComponent.createdIndex.push(child);

      currentComponent.untrackChild = (child: ChildNode | SeidrComponent) => {
        if (isServer()) {
          const index = currentComponent.createdIndex.indexOf(child);
          if (index !== -1) {
            currentComponent.createdIndex.splice(index, 1);
          }
        }
      };
    }

    // Add to component registry
    registry.add(currentComponent);

    // Set active component scope
    setComponentScope(currentComponent);

    if (!process.env.SEIDR_DISABLE_SSR) {
      if (isServer()) {
        getSSRScope()?.registerComponent(currentComponent);
      } else if (isHydrating()) {
        getHydrationContext()?.pushComponent(currentComponent);
      }
    }

    try {
      const childToNodes = (item: SeidrChild): ChildNode[] => {
        if (isNullish(item) || isBool(item)) {
          return [];
        }
        if (isStr(item) || isNum(item)) {
          return [$text(item)];
        } else if (isValue(item)) {
          return createReactiveValueNodes(item, (cleanup) => componentUnmountedFns.push(cleanup));
        } else if (isComponent(item)) {
          currentComponent.addChild(item);
          return item.nodes;
        }
        return [item as ChildNode];
      };

      // Execute component factory function and process results
      const result = factory(props);
      const nodes = (isArray(result) ? result : [result]).filter(Boolean).flatMap(childToNodes);
      setComponentNodes(currentComponent, nodes);
    } finally {
      setComponentScope(parentComponent);
      if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
        getHydrationContext()?.popComponent();
      }
    }

    if (parentComponent) {
      parentComponent.addChild(currentComponent);
    }

    return currentComponent;
  }) as SeidrComponentFactory<P>;

  defineValueProp(componentFactory, TYPE_PROP, TYPE_COMPONENT_FACTORY);
  defineValueProp(componentFactory, "name", name);

  return componentFactory;
}
