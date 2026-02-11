import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { getMarkerComments } from "../dom/get-marker-comments";
import { $text } from "../dom/text";
import type { SeidrChild } from "../element";
import { getNextId, getRenderContext } from "../render-context";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isNum, isStr } from "../util/type-guards/primitive-types";
import { isSeidrComponent } from "../util/type-guards/seidr-dom-types";
import { createScope } from "./component-scope";
import { getComponentStack } from "./component-stack";
import type {
  SeidrComponent,
  SeidrComponentChildren,
  SeidrComponentFactory,
  SeidrComponentFunction,
  SeidrComponentReturnValue,
} from "./types";

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
 * @param {(props: P) => SeidrComponentReturnValue} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export const component = <P = void>(
  factory: SeidrComponentFunction<P>,
  name: string = "Component",
): SeidrComponentFactory<P> => {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props: P) => {
    const id = `${name}-${getRenderContext().ctxID}-${getNextId()}`;
    const scope = createScope(id);
    const stack = getComponentStack();
    const isRootComponent = stack.length === 0;

    // Create partial SeidrComponent
    const comp = {
      [TYPE_PROP]: TYPE_COMPONENT,
      id,
      scope,
      unmount: () => {
        // If already destroyed, do nothing
        if (comp.scope.isDestroyed) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[${id}] Unmounting already destroyed component`);
          }
          return;
        }

        // Destroy the scope
        comp.scope.destroy();

        // Remove the start marker
        comp.startMarker?.remove();

        /**
         * Removes a child component or DOM node from the DOM.
         * @param {SeidrComponentChildren} child - The child component or DOM node to remove
         */
        const removeChild = (child: SeidrComponentChildren): void => {
          if (isSeidrComponent(child)) {
            child.unmount();
          } else if (isDOMNode(child)) {
            child.remove();
          }
        };

        // Remove the element
        const el = comp.element;
        if (isArray(el)) {
          el.forEach(removeChild);
        } else {
          removeChild(el);
        }

        // Remove the end marker
        comp.endMarker?.remove();
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
      const result = factory(props);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): SeidrComponentChildren =>
        isSeidrComponent(item) ? item.element : isStr(item) || isNum(item) ? $text(item) : item;

      const [startMarker, endMarker] = getMarkerComments(id);
      comp.startMarker = startMarker;
      comp.endMarker = endMarker;
      comp.element = isArray(result) ? (result.map(toNode).filter(Boolean) as SeidrComponentChildren) : toNode(result);
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
      if (process.env.NODE_ENV === "development") {
        console.warn(`[${id}] Component stack not cleared`);
      }
      while (stack.length) {
        stack.pop();
      }
    }

    return comp;
  }) as SeidrComponentFactory<P>;

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
