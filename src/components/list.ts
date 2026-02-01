import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { $fragment, findMarkers, type SeidrFragment, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import { createServerDocumentFragment } from "../ssr";
import { isHydrating, isSSR } from "../util/env";

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

    let fragment: SeidrFragment;
    if (isSSR()) {
      fragment = createServerDocumentFragment(id) as any;
    } else if (isHydrating()) {
      const [s, e] = findMarkers(id);
      fragment = $fragment([], id, s || undefined, e || undefined);
    } else {
      fragment = $fragment([], id);
    }

    const componentMap = new Map<I, SeidrComponent>();

    const update = (items: T[]) => {
      const parent = fragment.parentNode;
      const newKeys = new Set(items.map(getKey));

      // Remove components no longer in list
      for (const [key, comp] of componentMap.entries()) {
        if (!newKeys.has(key)) {
          comp.destroy();
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
          componentMap.set(key, comp);
        }

        // Move to correct position if needed
        if (comp.element.nextSibling !== currentAnchor) {
          const needsAttachment = isSSR() || !comp.element.parentNode;
          fragment.insertBefore(comp.element as Node, currentAnchor);

          // Trigger onAttached if component was newly added to DOM
          if (needsAttachment && parent && comp.scope.onAttached) {
            comp.scope.onAttached(parent);
          }
        }

        currentAnchor = comp.element as Node;
      }
    };

    // Initial render
    fragment.clear();
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
        comp.destroy();
      }
      componentMap.clear();
    });

    return fragment;
  })();
}
