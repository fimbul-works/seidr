import { getMarkerComments } from "../dom-utils";
import { $text, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { SEIDR_CLEANUP, TYPE, TYPE_PROP } from "../types";
import { isArr, isBool, isEmpty, isHTMLElement, isNum, isSeidrComponent, isStr } from "../util/type-guards";
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
 * @param {(props: P) => SeidrNode | SeidrNode[] | null} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export function component<P = void>(
  factory: (props: P, id: string) => SeidrNode | SeidrNode[] | null,
  name: string = "component",
): SeidrComponentFactory<P> {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props?: P) => {
    const ctx = getRenderContext();
    const instanceId = ctx.idCounter++;
    const id = `${name}-${ctx.ctxID}-${instanceId}`;

    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;

    // Create the scope and partial SeidrComponent
    const scope = createScope(id);
    const comp = {
      [TYPE_PROP]: TYPE.COMPONENT,
      id,
      scope,
      unmount: () => {
        if (comp.scope.isDestroyed) return;
        comp.scope.destroy();

        if (comp.start && (comp.start as any).remove) (comp.start as any).remove();

        const el = comp.element;
        if (isArr(el)) {
          el.forEach((child) => {
            if (isSeidrComponent(child)) {
              child.unmount();
            } else if (child && (child as any).remove) {
              (child as any).remove();
            }
          });
        } else if (el && (el as any).remove) {
          (el as ChildNode).remove();
        }

        if (comp.end && (comp.end as any).remove) (comp.end as any).remove();
      },
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
      const result = factory(props as P, id);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: any): any => {
        if (isEmpty(item) || isBool(item)) {
          return null;
        }
        if (isSeidrComponent(item)) {
          return item; // Keep component in array if possible? No, we return element for consistency with older code
        }
        if (isStr(item) || isNum(item)) {
          return $text(item);
        }
        return item;
      };

      // In component.ts, toNode should probably return the element if we want it to be a DOM node
      const toNodeResult = (item: any): any => {
        const node = toNode(item);
        return isSeidrComponent(node) ? node.element : node;
      };

      // Normalize result: wrap arrays, null, and undefined
      const [startMarker, endMarker] = getMarkerComments(id);
      comp.start = startMarker;
      comp.end = endMarker;

      if (isArr(result)) {
        const children = result.map(toNodeResult).filter(Boolean);
        comp.element = [startMarker, ...children, endMarker];
      } else if (isEmpty(result) || isBool(result)) {
        comp.element = [startMarker, endMarker];
      } else {
        // Single node or component
        const node = toNode(result);
        if (isSeidrComponent(node)) {
          // If result is a single component, we delegate markers to it if it has them
          // But actually we should wrap it to be safe or just follow existing pattern
          comp.element = node.element;
        } else {
          comp.element = node;
        }
      }

      // Link element cleanup to scope destroy
      if (comp.element && !isArr(comp.element)) {
        const el = comp.element as any;
        const originalCleanup = el[SEIDR_CLEANUP];
        el[SEIDR_CLEANUP] = () => {
          if (originalCleanup) originalCleanup();
          comp.unmount();
        };
      }
    } catch (err) {
      comp.unmount();
      throw err;
    } finally {
      // Remove from stack
      stack.pop();
    }

    // Apply root element attributes
    if (isRootComponent && isHTMLElement(comp.element)) {
      comp.element.dataset.seidrRoot = String(getRenderContext().ctxID);
    }

    // Root component must clear out component stack
    if (isRootComponent && stack.length > 0) {
      while (stack.length) stack.pop();
    }

    return comp;
  }) as SeidrComponentFactory<P>;

  componentFactory[TYPE_PROP] = TYPE.COMPONENT_FACTORY;

  return componentFactory;
}
