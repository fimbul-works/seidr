import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { $fragment, clearBetween, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import { isSSR } from "../util/env";

/**
 * Renders an efficient list of components from an observable array.
 * Uses a marker node to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template {string | number} I - Unique key type
 * @template {SeidrNode} C - The type of SeidrNode for list items
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => I} getKey - Key extraction function
 * @param {(item: T) => C} factory - Component creation function (raw or wrapped)
 * @returns {SeidrComponent<SeidrFragment>} List component
 */
export function List<T, I extends string | number, C extends SeidrNode>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => C,
): SeidrComponent<SeidrFragment> {
  return component(() => {
    const scope = useScope();
    const ctx = getRenderContext();
    const instanceId = ctx.idCounter++;
    const id = `list-${ctx.ctxID}-${instanceId}`;

    const [s, e] = findMarkers(id);
    const fragment = $fragment([], id, s || undefined, e || undefined);
    const start = (fragment as any).start as Comment;
    const end = (fragment as any).end as Comment;

    const componentMap = new Map<I, SeidrComponent>();

    const update = (items: T[]) => {
      const parent = end.parentNode; // Anchor to end marker parent
      if (!parent) return; // Not mounted yet?

      const newKeys = new Set(items.map(getKey));

      // Remove components no longer in list
      for (const [key, comp] of componentMap.entries()) {
        if (!newKeys.has(key)) {
          comp.unmount();
          componentMap.delete(key);
        }
      }

      // Add or reorder components by iterating backwards from end marker
      let currentAnchor: Node = end;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let comp = componentMap.get(key);

        if (!comp) {
          comp = wrapComponent<typeof item>(factory as any)(item);
          componentMap.set(key, comp);
        }

        // Move to correct position if needed
        const el = comp.element as any;
        const targetAnchor = el.start || el; // Handle if child is fragment? SeidrFragment start or Text/Element

        if (el.nextSibling !== currentAnchor) {
          const needsAttachment = isSSR() || !el.parentNode;
          // Use parent.insertBefore explicitly
          parent.insertBefore(el, currentAnchor);

          // Trigger onAttached if component was newly added to DOM
          if (needsAttachment && comp.scope.onAttached) {
            comp.scope.onAttached(parent);
          }
        }

        currentAnchor = targetAnchor;
      }
    };

    // Initial render
    clearBetween(start, end);
    update(observable.value);

    // Ensure onAttached is propagated
    scope.onAttached = (parent) => {
      for (const comp of componentMap.values()) {
        if (comp.scope.onAttached) comp.scope.onAttached(parent);
      }
    };

    scope.track(observable.observe(update));

    // Secondary cleanup tracking for map contents
    scope.track(() => {
      for (const comp of componentMap.values()) {
        comp.unmount();
      }
      componentMap.clear();
    });

    return fragment;
  })();
}
