import { getAppState } from "../../app-state/app-state.js";
import { isFn } from "../../util/type-guards.js";
import { onUnmountedFns } from "../lifecycle/on-unmounted.js";
import type { SeidrComponent } from "../types.js";

/**
 * Set root nodes for a component.
 * If the nodes contain more or less than 1 node, marker comments are automatically added.
 *
 * @param {SeidrComponent} instance
 * @param {ChildNode[]} nodes
 */
export function unsetComponentNodes(currentComponent: SeidrComponent) {
  const appState = getAppState();

  currentComponent.nodes.forEach((n) => {
    if (onUnmountedFns?.has(n)) {
      const fns = onUnmountedFns.get(n);
      onUnmountedFns.delete(n);
      fns?.forEach((fn) => fn());
    }

    if (isFn(n.contains)) {
      for (const [targetNode, fns] of Array.from(onUnmountedFns.entries())) {
        if (targetNode !== n) {
          let isContained = false;
          try {
            isContained = Boolean(n.contains?.(targetNode));
          } catch {
            isContained = false;
          }

          if (isContained) {
            onUnmountedFns.delete(targetNode);
            fns.forEach((fn) => fn());
          }
        }
      }
    }

    n.remove();
    appState.nodeIndex.delete(n);
  });
}
