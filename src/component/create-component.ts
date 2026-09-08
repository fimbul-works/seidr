import { getAppState } from "../app-state/app-state.js";
import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants.js";
import { createReactiveValueNodes } from "../dom/append-child.js";
import { $text } from "../dom/node/text.js";
import type { SeidrChild } from "../element/types.js";
import { isComponent } from "./type-guards.js";
import { isValue } from "../observable/type-guards.js";
import { defineValueProp } from "../util/define-prop.js";
import { fastMix } from "@fimbul-works/hash";
import { fastHash } from "../util/fast-hash.js";
import { isArray, isBool, isFn, isNullish, isNum, isStr } from "../util/type-guards.js";
import { isServer } from "../util/environment/is-server.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { getComponentScope, setComponentScope } from "./lifecycle/component-scope.js";
import { onUnmountedFns } from "./lifecycle/on-unmounted.js";
import type {
  OnAttachedFunction,
  OnMountedFunction,
  SeidrComponent,
  SeidrComponentFactory,
  SeidrComponentFactoryPureFunction,
} from "./types.js";
import { setComponentNodes } from "./util/set-component-nodes.js";
import type { CleanupFunction } from "../types.js";

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
    const appState = getAppState();
    const parentComponent = getComponentScope();

    // Determine ID
    let id: number;
    if (parentComponent) {
      // Handle collision by incrementing ID value until a free slot is found
      const siblings = new Set(Array.from(parentComponent.children).map((c) => c.id));
      let idCounter = siblings.size + 1;
      id = fastHash(!isNullish(identifier) ? identifier : idCounter, parentComponent.id);
      while (siblings.has(id)) {
        id = fastMix(++idCounter, id);
      }
    } else {
      // Root component
      const roots = new Set(
        Array.from(appState.components)
          .filter((c) => !c.owner)
          .map((c) => c.id),
      );
      let idCounter = roots.size + 1;
      id = fastHash(!isNullish(identifier) ? identifier : idCounter, appState.ctxID);
      while (roots.has(id)) {
        id = fastMix(++idCounter, id);
      }
    }

    // Running counter for Value IDs
    let valueIdCounter = 1;

    const componentMountedFns: OnMountedFunction[] = [];
    const componentAttachedFns: OnAttachedFunction[] = [];
    const componentUnmountedFns: CleanupFunction[] = [];

    const createdIndex: (ChildNode | SeidrComponent)[] = [];
    const childCreatedIndex = new Map<Node | SeidrComponent, string>();

    // Create component instance
    const currentComponent: SeidrComponent = {
      get [TYPE_PROP]() {
        return TYPE_COMPONENT as typeof TYPE_COMPONENT;
      },
      id,
      name,
      isMounted: false,
      nodes: [],
      children: new Set(),
      createdIndex,
      childCreatedIndex,
      trackChild(child: ChildNode | SeidrComponent) {
        if (isServer() && createdIndex.indexOf(child) === -1) {
          createdIndex.push(child);
        }
      },
      untrackChild(child: ChildNode | SeidrComponent) {
        if (isServer()) {
          const index = createdIndex.indexOf(child);
          if (index !== -1) {
            createdIndex.splice(index, 1);
          }
        }
      },
      onMount: (fn: OnMountedFunction) => componentMountedFns.push(fn),
      onAttach: (fn: OnAttachedFunction) => componentAttachedFns.push(fn),
      onUnmount: (fn: CleanupFunction) => componentUnmountedFns.push(fn),
      owner: parentComponent,
      unmount(): void {
        if (isServer()) {
          getSSRScope()?.unregisterComponent(currentComponent);
          createdIndex.length = 0;
          currentComponent.owner?.untrackChild?.(currentComponent);
        }

        if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
          getHydrationContext()?.removeComponent(currentComponent);
        }

        appState.components.delete(currentComponent);
        currentComponent.owner?.children.delete(currentComponent);

        currentComponent.nodes.forEach((n) => {
          if (n && isFn(n.remove)) {
            if (onUnmountedFns?.has(n)) {
              const fns = onUnmountedFns.get(n);
              onUnmountedFns.delete(n);
              fns?.forEach((fn) => fn());
            }
            if (isFn((n as any).contains) && onUnmountedFns && onUnmountedFns.size > 0) {
              for (const [targetNode, fns] of Array.from(onUnmountedFns.entries())) {
                if (targetNode !== n) {
                  let isContained = false;
                  try {
                    isContained = Boolean((n as any).contains?.(targetNode));
                  } catch {
                    isContained = false;
                  }
                  if (isContained) {
                    onUnmountedFns.delete(targetNode);
                    fns.forEach((fn) => fn());
                  }
                }
              }
            }
            n.remove();
            appState.nodeIndex.delete(n);
          }
        });
        componentUnmountedFns.forEach((fn) => fn());
        componentUnmountedFns.length = 0;
        currentComponent.children.forEach((c) => c.unmount());
        currentComponent.children.clear();
        currentComponent.isMounted = false;
      },
      get nextValueId() {
        return valueIdCounter++;
      },
    };
    appState.components.add(currentComponent);
    if (parentComponent) {
      parentComponent.children.add(currentComponent);
      if (isServer()) {
        parentComponent.trackChild?.(currentComponent);
      }
    }

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
          item.isMounted = true;
          item.owner = currentComponent;
          currentComponent.children.add(item);
          if (isServer()) {
            currentComponent.trackChild?.(item);
          }
          return item.nodes;
        }
        return [item as ChildNode];
      };

      // Execute component factory function and process results
      const result = factory(props);
      const nodes = (isArray(result) ? result : [result]).filter(Boolean).flatMap(childToNodes);
      setComponentNodes(currentComponent, nodes);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setComponentScope(parentComponent);
      if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
        getHydrationContext()?.popComponent();
      }
    }

    if (parentComponent && isServer()) {
      parentComponent.trackChild?.(currentComponent);
    }

    return currentComponent;
  }) as SeidrComponentFactory<P>;

  defineValueProp(componentFactory, TYPE_PROP, TYPE_COMPONENT_FACTORY);
  defineValueProp(componentFactory, "name", name);

  return componentFactory;
}
