import { type SeidrComponent, wrapComponent } from "../component";
import { $fragment, type SeidrElement, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";

/**
 * Renders an efficient list of components from an observable array.
 *
 * mountList provides optimized list rendering with key-based diffing, ensuring
 * minimal DOM operations when the list changes. Components are reused when
 * possible, and only the necessary additions, removals, and reordering occur.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {any} T - The type of list items
 * @template {string | number} I - The type of unique item keys (string or number)
 * @template {SeidrNode} C - The type of SeidrNode for list items
 *
 * @param {Seidr<T[]>} observable - Array observable containing the list data
 * @param {(item: T) => I} getKey - Function to extract unique keys from list items
 * @param {(item: T) => C} factory - Function that creates components for individual items
 * @param {HTMLElement | SeidrElement} container - The DOM container for the list
 * @returns {CleanupFunction} A cleanup function that removes all components and reactive bindings
 */
export function mountList<T, I extends string | number, C extends SeidrNode>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => C,
  container: HTMLElement | SeidrElement,
): CleanupFunction {
  // Bind the container to the render context if not already bound
  const ctx = getRenderContext();
  if (!ctx.rootNode) {
    ctx.rootNode = container;
  }

  const fragment = $fragment([], `mount-list:${ctx.ctxID}-:${ctx.idCounter++}`);
  container.appendChild(fragment as Node);
  const componentMap = new Map<I, SeidrComponent>();

  const update = (items: T[]) => {
    const newKeys = new Set(items.map(getKey));

    // Remove components no longer in list
    for (const [key, comp] of componentMap.entries()) {
      if (!newKeys.has(key)) {
        comp.unmount();
        componentMap.delete(key);
      }
    }

    // Add or reorder components by iterating backwards from end marker
    let currentAnchor: Node = fragment.end;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const key = getKey(item);
      let comp = componentMap.get(key);

      if (!comp) {
        comp = wrapComponent<typeof item>(factory as any)(item);
        componentMap.set(key, comp as SeidrComponent);
      }

      // Move to correct position if needed
      const el = (comp as SeidrComponent).element as any;
      // Use helper or property to get start node.
      // SeidrFragment has 'start', SeidrElement (Node) is itself.
      const targetAnchor = (el as any).start || el;

      if (el.nextSibling !== currentAnchor) {
        const needsAttachment = !el.parentNode;

        // SeidrFragment (if el is one) handles insertBefore naturally via documentFragment behavior
        // But if it's ALREADY in dom, insertBefore moves it.
        // `fragment.insertBefore`? No, we insert into `container` (fragment parent).
        // `fragment` variable here refers to the wrapper, but the *content* is in `container`.
        if (currentAnchor.parentNode) {
          currentAnchor.parentNode.insertBefore(el, currentAnchor);
        }

        // Trigger onAttached if component was newly added to DOM
        if (needsAttachment && comp.scope.onAttached) {
          comp.scope.onAttached(container as any);
        }
      }

      currentAnchor = targetAnchor;
    }
  };

  // Initial render
  update(observable.value);

  // Reactive updates
  const cleanup = observable.observe((items) => update(items));

  // Return combined cleanup
  return () => {
    cleanup();
    for (const comp of componentMap.values()) {
      comp.unmount();
    }
    componentMap.clear();
  };
}
