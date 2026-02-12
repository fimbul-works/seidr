import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { getMarkerComments } from "../dom/get-marker-comments";
import { $text } from "../dom/text";
import type { SeidrChild } from "../element";
import { getNextId, getRenderContext } from "../render-context";
import { tryCatchFinally } from "../util/try-catch-finally";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isNum, isStr } from "../util/type-guards/primitive-types";
import { isSeidrComponent } from "../util/type-guards/seidr-dom-types";
import { createScope, setScopeComponent } from "./component-scope";
import { getCurrentComponent, pop, push } from "./component-stack";
import type {
  SeidrComponent,
  SeidrComponentChildren,
  SeidrComponentFactory,
  SeidrComponentFactoryPureFunction,
} from "./types";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * @template P - Props object type (optional)
 *
 * @param {SeidrComponentFactoryPureFunction<P>} factory - Function that accepts props and creates the component element
 * @returns {SeidrComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export const component = <P = void>(
  factory: SeidrComponentFactoryPureFunction<P>,
  name: string = "Component",
): SeidrComponentFactory<P> => {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props: P) => {
    const ctx = getRenderContext();
    const parent = getCurrentComponent();
    const ctxID = String(ctx.ctxID);
    const id = `${name}-${ctxID}-${getNextId()}`;
    // The previous component is the current cursor, or if null, check if we have a root component context
    // Actually, getCurrentComponent() handles it. If it returns null, we are at root.
    // But wait, user said "Root component should be the result of getCurrentComponent() when the stack points to the root"
    // So if getCurrentComponent() is null, we are truly at the root.
    const scope = createScope(id, parent);

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

        // Destroy the scope - this handles children destruction via recursion
        comp.scope.destroy();

        // Remove from parent scope
        comp.scope.parent?.scope.removeChild(comp);

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

    // Link scope to component instance for observe() context restoration
    setScopeComponent(scope, comp);

    // Set as current component (Push to tree)
    push(comp);

    // Render the component via factory
    tryCatchFinally(
      () => {
        // Call factory with props (or undefined if no props)
        const result = factory(props);

        // Helper to normalize SeidrNode to DOM Node (or string in SSR)
        const toNode = (item: SeidrChild): SeidrComponentChildren => (isStr(item) || isNum(item) ? $text(item) : item);

        const [startMarker, endMarker] = getMarkerComments(id);
        comp.startMarker = startMarker;
        comp.endMarker = endMarker;
        comp.element = isArray(result)
          ? (result.map(toNode).filter(Boolean) as SeidrComponentChildren)
          : toNode(result);
      },
      () => {
        pop();
      },
      (err) => {
        // Restore previous component (Pop from tree)
        comp.unmount();
        throw err;
      },
    );

    // Apply root element attributes
    if (!parent) {
      if (isHTMLElement(comp.element)) {
        comp.element.dataset.seidrRoot = ctxID;
      } else if (isArray(comp.element)) {
        const firstChild = comp.element.find(isHTMLElement);
        if (firstChild) {
          firstChild.dataset.seidrRoot = ctxID;
        }
      }
    }

    // Register as child component after factory runs to ensure onAttached handlers are set
    if (parent) {
      parent.scope.child(comp);
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
