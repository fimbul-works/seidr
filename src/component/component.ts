import { getMarkerComments } from "../dom-utils";
import { $text, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { TYPE, TYPE_PROP } from "../types";
import {
  isArr,
  isBool,
  isComment,
  isEmpty,
  isHTMLElement,
  isNum,
  isSeidrComponent,
  isStr,
  isTextNode,
} from "../util/type-guards";
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
    const scope = createScope();
    const comp = {
      [TYPE_PROP]: TYPE.COMPONENT,
      id,
      scope,
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

      // Track child SeidrComponents to propagate onAttached
      const childComponents: SeidrComponent[] = [];

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: any): any => {
        if (isEmpty(item) || isBool(item)) {
          return null;
        }
        // Track child component for onAttached propagation
        if (isSeidrComponent(item)) {
          childComponents.push(item);
          return item.element;
        }
        if (isStr(item) || isNum(item)) {
          return $text(item);
        }
        return item;
      };

      // Normalize result: wrap arrays, null, and undefined
      if (isArr(result) || isEmpty(result) || isBool(result)) {
        const children = isArr(result) ? result.map(toNode).filter(Boolean) : [];
        const [startMarker, endMarker] = getMarkerComments(id);
        comp.element = children;
        comp.start = startMarker;
        comp.end = endMarker;
      } else {
        // Single node or component
        comp.element = toNode(result);
      }

      // Implement unmount
      comp.unmount = () => {
        if (comp.scope.isDestroyed) return;
        comp.scope.destroy();

        const el = comp.element;
        if (isArr(el)) {
          el.forEach((child) => {
            if (isSeidrComponent(child)) {
              child.unmount();
            } else if (isHTMLElement(child) || isTextNode(child) || isComment(child)) {
              child.remove();
            }
          });
        } else if (el && (el as any).remove) {
          // Standard Element / Text / Comment
          (el as ChildNode).remove();
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
    } catch (err) {
      scope.destroy();
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
