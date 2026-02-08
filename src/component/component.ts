import { SEIDR_CLEANUP, TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { getMarkerComments } from "../dom/get-marker-comments";
import { $text } from "../dom/text";
import type { SeidrElementInterface, SeidrNode } from "../element";
import { getNextId, getRenderContext } from "../render-context";
import { isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isBool, isEmpty, isNum, isStr } from "../util/type-guards/primitive-types";
import { isSeidrComponent, isSeidrElement } from "../util/type-guards/seidr-dom-types";
import { createScope } from "./component-scope";
import { getComponentStack } from "./component-stack";
import type { SeidrComponent, SeidrComponentChildren, SeidrComponentFactory } from "./types";

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
 * @param {(props: P) => SeidrComponentChildren} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export function component<P = void>(
  factory: (props: P, id: string) => SeidrComponentChildren,
  name: string = "component",
): SeidrComponentFactory<P> {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props?: P) => {
    const ctx = getRenderContext();
    const instanceId = getNextId();
    const id = `${name}-${ctx.ctxID}-${instanceId}`;

    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;

    // Create the scope and partial SeidrComponent
    const scope = createScope(id);
    const comp = {
      [TYPE_PROP]: TYPE_COMPONENT,
      id,
      scope,
      unmount: () => {
        if (comp.scope.isDestroyed) {
          return;
        }

        comp.scope.destroy();

        (comp.start as ChildNode)?.remove?.();

        const el = comp.element;
        if (isArray(el)) {
          el.forEach((child) => {
            if (isSeidrComponent(child)) {
              child.unmount();
            } else {
              (child as ChildNode)?.remove?.();
            }
          });
        } else {
          (el as ChildNode)?.remove?.();
        }

        (comp.end as ChildNode)?.remove?.();
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
      const toNode = (item: any): SeidrComponentChildren => {
        if (isEmpty(item) || isBool(item)) {
          return null;
        }

        if (isStr(item) || isNum(item)) {
          return $text(item);
        }

        if (isSeidrComponent(item)) {
          return item.element as SeidrNode | SeidrNode[];
        }

        return item;
      };

      // Normalize result: wrap arrays, null, and undefined
      const [startMarker, endMarker] = getMarkerComments(id);
      comp.start = startMarker;
      comp.end = endMarker;

      if (isArray(result)) {
        const children = result.map(toNode).filter(Boolean) as SeidrNode[];
        comp.element = [startMarker, ...children, endMarker];
      } else if (isEmpty(result) || isBool(result)) {
        comp.element = [startMarker, endMarker];
      } else {
        // Single node or component
        const node = toNode(result);
        comp.element = node;
      }

      // Link element cleanup to scope destroy
      if (isSeidrElement(comp.element)) {
        const el = comp.element as SeidrElementInterface;
        const originalCleanup = el[SEIDR_CLEANUP];
        el[SEIDR_CLEANUP] = () => {
          originalCleanup();
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
      console.warn("Component stack not cleared");
      while (stack.length) {
        stack.pop();
      }
    }

    return comp;
  }) as SeidrComponentFactory<P>;

  componentFactory[TYPE_PROP] = TYPE_COMPONENT_FACTORY;

  return componentFactory;
}
