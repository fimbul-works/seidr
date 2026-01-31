import { $fragment, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { ServerFragment } from "../ssr/dom/server-fragment";
import { ServerHTMLElement } from "../ssr/dom/server-html-element";
import { isHydrating, isSSR } from "../util/env";
import { isHTMLElement, isNum, isSeidrComponent, isSeidrFragment, isStr } from "../util/type-guards";
import { uid } from "../util/uid";
import { createScope } from "./component-scope";
import { getComponentStack } from "./component-stack";
import type { SeidrComponent, SeidrComponentFactory } from "./types";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * Components are the primary building blocks in Seidr applications. They encapsulate
 * both UI elements and the reactive logic needed to manage them. The component
 * function automatically tracks cleanup functions, reactive bindings, and child
 * components to prevent memory leaks.
 *
 * @template P - Props object type (optional)
 *
 * @param {(props: P) => SeidrNode} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 *

 */
export function component<P = void>(
  factory: P extends void ? () => SeidrNode : (props: P) => SeidrNode,
): SeidrComponentFactory<P> {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props?: P) => {
    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;

    // Create the scope and partial SeidrComponent
    const scope = createScope();
    const comp = {
      isSeidrComponent: true,
      scope,
      destroy: () => scope.destroy(),
    } as SeidrComponent;

    // Register as child component
    if (stack.length > 0) {
      stack[stack.length - 1].scope.child(comp);
    }

    // Add to component stack
    stack.push(comp);

    // Render the component via factory
    try {
      // Call factory with props (or undefined if no props)
      const result = factory(props as P);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: any): any => {
        if (isSeidrComponent(item)) return item.element;
        if (item === null || item === undefined || item === false || item === true) {
          return $comment("");
        }
        if (isStr(item) || isNum(item)) {
          if (isSSR()) return String(item);
          return $text(String(item));
        }
        if (isSeidrFragment(item)) return item;
        return item;
      };

      // Track child SeidrComponents to propagate onAttached
      const childComponents: SeidrComponent[] = [];
      const isSSRNow = isSSR();

      // Support for array returns (multiple root nodes)
      if (Array.isArray(result)) {
        const ctx = getRenderContext();
        const instanceId = ctx ? ctx.idCounter++ : uid();
        const id = ctx ? `ctx-${ctx.ctxID}-${instanceId}` : uid();
        const isSSRNow = isSSR();

        if (isSSRNow) {
          const fragment = new ServerFragment(id);
          result.forEach((item) => {
            const node = toNode(item);
            if (isSeidrComponent(item)) {
              childComponents.push(item);
            }
            fragment.appendChild(node);
          });
          comp.element = fragment as any;
        } else {
          // Check if hydrating and
          const isHydratingNow = isHydrating();
          let markers: [Comment | null, Comment | null] = [null, null];
          if (isHydratingNow) {
            markers = findMarkers(id);
          }
          const fragment = $fragment(result as any[], id, markers[0] || undefined, markers[1] || undefined);
          comp.element = fragment as any;
        }
      } else {
        // Unwrap SeidrComponents to their elements, or normalize primitives
        comp.element = toNode(result);
        // Track child component for onAttached propagation
        if (isSeidrComponent(result)) {
          childComponents.push(result);
        }
      }

      // Set up destroy method
      comp.destroy = () => {
        comp.scope.destroy();
        const el = comp.element as any;
        if (el?.remove) {
          el.remove();
        } else if (el?.parentNode) {
          try {
            el.parentNode.removeChild(el);
          } catch (_e) {
            // Ignore if node was already removed or parent changed
          }
        }
      };

      // Propagate onAttached from scope to child components
      if (childComponents.length > 0) {
        // Always wrap scope.onAttached (or create one) to call child components' onAttached
        const originalOnAttached = scope.onAttached;
        scope.onAttached = (parent: Node) => {
          // Call onAttached for all child components first
          for (const child of childComponents) {
            if (child.scope.onAttached) {
              child.scope.onAttached(parent);
            }
          }
          // Then call this component's scope.onAttached (if it exists)
          if (originalOnAttached) {
            originalOnAttached(parent);
          }
        };
      }
    } finally {
      // Remove from stack
      stack.pop();
    }

    // Apply root element attributes
    if (isRootComponent && isHTMLElement(comp.element)) {
      comp.element.dataset.seidrRoot = String(getRenderContext()?.ctxID ?? true);
    }

    // Root component must clear out component stack
    if (isRootComponent && stack.length > 0) {
      while (stack.length) stack.pop();
    }

    return comp;
  }) as SeidrComponentFactory<P>;

  // Add component factory flag
  componentFactory.isComponentFactory = true;
  return componentFactory;
}
