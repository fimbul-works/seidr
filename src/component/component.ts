import { TYPE_COMPONENT, TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import { $text } from "../dom/text";
import type { SeidrChild } from "../element";
import { getNextId, getRenderContext } from "../render-context";
import { safe } from "../util/safe";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isNum, isStr } from "../util/type-guards/primitive-types";
import { isComponent } from "../util/type-guards/seidr-dom-types";
import { createScope } from "./component-scope";
import { getCurrentComponent, pop, push } from "./component-stack";
import { getMarkerComments } from "./get-marker-comments";
import type { Component, ComponentChildren, ComponentFactory, ComponentFactoryPureFunction } from "./types";

/**
 * Creates a component with automatic lifecycle and resource management.
 *
 * @template P - Props object type (optional)
 *
 * @param {ComponentFactoryPureFunction<P>} factory - Function that accepts props and creates the component element
 * @returns {ComponentFactory<P>} A function that accepts props and returns a Component instance
 */
export const component = <P = void>(
  factory: ComponentFactoryPureFunction<P>,
  name: string = "Component",
): ComponentFactory<P> => {
  // Return a function that accepts props and creates the component
  const componentFactory = ((props: P) => {
    const ctx = getRenderContext();
    const parent = getCurrentComponent();
    const ctxID = String(ctx.ctxID);
    const id = `${name}-${ctxID}-${getNextId()}`;
    const scope = createScope(id, parent);

    // Create partial Component
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
         * @param {ComponentChildren} child - The child component or DOM node to remove
         */
        const removeChild = (child: ComponentChildren): void => {
          if (isComponent(child)) {
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
    } as Component;

    // Link scope to component instance for observe() context restoration
    // @ts-expect-error
    scope.component = comp;

    // Set as current component (Push to tree)
    push(comp);

    // Render the component via factory
    try {
      // Call factory with props (or undefined if no props)
      const result = factory(props);

      // Helper to normalize SeidrNode to DOM Node (or string in SSR)
      const toNode = (item: SeidrChild): ComponentChildren => (isStr(item) || isNum(item) ? $text(item) : item);

      const [startMarker, endMarker] = getMarkerComments(id);
      comp.startMarker = startMarker;
      comp.endMarker = endMarker;
      comp.element = isArray(result) ? (result.map(toNode).filter(Boolean) as ComponentChildren) : toNode(result);
    } catch (err) {
      // Restore previous component (Pop from tree)
      comp.unmount();
      throw err;
    } finally {
      pop();
    }

    // Apply root element attributes
    if (!parent) {
      /**
       * Recursively applies the seidrRoot dataset attribute to the first HTMLElement found.
       * @param {ComponentChildren} item - The child to search
       */
      const applyRootMarker = (item: ComponentChildren): void => {
        if (isHTMLElement(item)) {
          item.dataset.seidrRoot = ctxID;
        } else if (isComponent(item)) {
          applyRootMarker(item.element);
        } else if (isArray(item)) {
          for (const child of item) {
            applyRootMarker(child);
            // Only mark the first one found in the array to avoid multiple roots
            const firstMarked =
              isHTMLElement(child) || (isComponent(child) && !!(child.element as HTMLElement)?.dataset?.seidrRoot);
            if (firstMarked) break;
          }
        }
      };

      applyRootMarker(comp.element);
    }

    // Register as child component after factory runs to ensure onAttached handlers are set
    parent?.scope.child(comp);

    return comp;
  }) as ComponentFactory<P>;

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
