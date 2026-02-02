import { $fragment, $text, findMarkers, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import { TYPE, TYPE_PROP } from "../types";
import { isHydrating, isSSR } from "../util/env";
import { isBool, isEmpty, isHTMLElement, isNum, isSeidrComponent, isSeidrFragment, isStr } from "../util/type-guards";
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
      [TYPE_PROP]: TYPE.COMPONENT,
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
      const result = factory(props as P);

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

      // Process final render result
      const ctx = getRenderContext();
      const instanceId = ctx.idCounter++;
      const id = `ctx-${ctx.ctxID}-${instanceId}`;

      const isHydratingNow = isHydrating();
      const isSSRNow = isSSR();

      // Normalize result: wrap arrays, null, and undefined in a fragment
      if (Array.isArray(result) || isEmpty(result) || isBool(result)) {
        const children = Array.isArray(result) ? result.map(toNode).filter(Boolean) : [];
        if (!isSSRNow && isHydratingNow) {
          const [s, e] = findMarkers(id);
          comp.element = $fragment(children, id, s || undefined, e || undefined);
        } else {
          comp.element = $fragment(children, id);
        }
      } else {
        // Single node or component
        const node = toNode(result);
        if (isSeidrFragment(node)) {
          // If it's already a fragment, use it as is but ensure ID is tracked?
          // Actually, fragments from $fragment already have IDs.
          comp.element = node;
        } else {
          comp.element = node;
        }
      }

      // Implement unmount
      comp.unmount = () => {
        if (comp.scope.isDestroyed) return;
        comp.scope.destroy();

        const el = comp.element;
        if (isSeidrFragment(el)) {
          // Fragment: Find markers and remove range
          // We must use 'findMarkers' dynamically because they might be in DOM
          // or passed in. If fragment was just created, markers are in it?
          // If mounted, they are in parent.
          // We use the ID to be sure.
          const [s, e] = findMarkers(el.id);
          if (s && e) {
            // clearBetween equivalent
            if (s.parentNode) {
              let curr = s.nextSibling;
              while (curr && curr !== e) {
                const next = curr.nextSibling;
                if (curr.parentNode) curr.parentNode.removeChild(curr);
                curr = next;
              }
              // Remove markers themselves
              if (e.parentNode) e.parentNode.removeChild(e);
              if (s.parentNode) s.parentNode.removeChild(s);
            }
          }
        } else if (el && (el as any).remove) {
          // Standard Element / Text / Comment
          (el as ChildNode).remove();
        }
      };

      // Unified Lifecycle: Monkey-patch element.remove() only for non-Fragments
      // This maintains compatibility with direct DOM manipulation for single roots.
      if (comp.element && !isSeidrFragment(comp.element)) {
        const el = comp.element as ChildNode;
        const oR = el.remove.bind(el);
        el.remove = () => {
          // If remove called directly, trigger unmount logic (scope destroy)
          // But valid only if not destroyed
          if (!comp.scope.isDestroyed) comp.scope.destroy();
          if (oR) oR();
          else if (el.parentNode) el.parentNode.removeChild(el);
        };
      }

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

  // Add component factory flag
  componentFactory[TYPE_PROP] = TYPE.COMPONENT_FACTORY;
  return componentFactory;
}
