import { getRenderContext } from "../../core/render-context-contract";
import { isHTMLElement, isNum, isStr } from "../../util/type-guards";
import { isSeidrComponent } from "../../util/type-guards/is-seidr-component";
import { $comment, $text, type SeidrNode } from "../element/element";
import { createScope } from "./component-scope";
import { getComponentStack } from "./component-stack";
import type { SeidrComponent, SeidrComponentFactory } from "./types";

// Check if we're in SSR mode
const isSSR = typeof window === "undefined" || (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);

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
          if (isSSR) return String(item);
          return $text(String(item));
        }
        return item;
      };

      // Track child SeidrComponents to propagate onAttached
      const childComponents: SeidrComponent[] = [];

      // Support for array returns (multiple root nodes)
      if (Array.isArray(result)) {
        if (isSSR) {
          // In SSR, we can't use DocumentFragment because ServerComment instances
          // can't be appended to real DOM fragments. Instead, create a wrapper div.
          const wrapper = new ServerHTMLElement("div");
          result.forEach((item) => {
            const node = toNode(item);
            // Track child components for onAttached propagation
            if (isSeidrComponent(item)) {
              childComponents.push(item);
            }
            // ServerHTMLElement.appendChild knows how to handle strings and ServerComments
            (wrapper as any).appendChild(node);
          });
          comp.element = wrapper as any;
        } else {
          // Client-side: Use DocumentFragment as normal
          const fragment = document.createDocumentFragment();
          result.forEach((item) => {
            const node = toNode(item);
            // Track child components for onAttached propagation
            if (isSeidrComponent(item)) {
              childComponents.push(item);
            }
            fragment.appendChild(node as Node);
          });
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
