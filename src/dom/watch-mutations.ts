import { getAppState } from "../app-state/app-state.js";
import { onMountedFns } from "../component/lifecycle/on-mounted.js";
import { onUnmountedFns } from "../component/lifecycle/on-unmounted.js";
import { DATA_KEY_MUTATION_OBSERVERS } from "../constants.js";
import type { CleanupFunction } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { isFn } from "../util/type-guards.js";

/**
 * Internal single mutation observer state stored in AppState.
 */
export interface MutationObserverState {
  activeObserver: MutationObserver | null;
  watchCount: number;
}

/**
 * Helper to process mount and attached hooks for a node and any of its registered descendants.
 * @param {Node} node - Node to process
 */
function processAddedNode(node: Node) {
  if (!node.isConnected) return;

  // Trigger onMounted callbacks
  if (onMountedFns?.has(node)) {
    const fns = onMountedFns.get(node);
    onMountedFns.delete(node);
    fns?.forEach((fn) => fn());
  }

  // Process any registered descendants if node is a ParentNode
  if (isFn(node.contains)) {
    if (onMountedFns && onMountedFns.size > 0) {
      for (const [targetNode, fns] of Array.from(onMountedFns.entries())) {
        if (targetNode !== node && node.contains(targetNode) && targetNode.isConnected) {
          onMountedFns.delete(targetNode);
          fns.forEach((fn) => fn());
        }
      }
    }
  }
}

/**
 * Helper to process unmount hooks for a node and any of its registered descendants.
 * @param {Node} node - Node to process
 */
function processRemovedNode(node: Node) {
  if (node.isConnected) return;

  // Process the node itself
  if (onUnmountedFns?.has(node)) {
    const fns = onUnmountedFns.get(node);
    onUnmountedFns.delete(node);
    fns?.forEach((fn) => fn());
  }

  // Process any registered descendants if node is a ParentNode
  if (isFn(node.contains) && onUnmountedFns && onUnmountedFns.size > 0) {
    for (const [targetNode, fns] of Array.from(onUnmountedFns.entries())) {
      if (targetNode !== node && node.contains(targetNode) && !targetNode.isConnected) {
        onUnmountedFns.delete(targetNode);
        fns.forEach((fn) => fn());
      }
    }
  }
}

/**
 * Creates and starts a MutationObserver on the root element.
 * @param {Element} root - The root DOM element to observe
 * @returns {MutationObserver} The active observer
 */
function createRootObserver(root: Element): MutationObserver {
  const runTask = queueMicrotask;
  const CHILD_LIST = "childList";

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === CHILD_LIST) {
        mutation.addedNodes.forEach((added) => runTask(() => processAddedNode(added)));
        mutation.removedNodes.forEach((removed) => runTask(() => processRemovedNode(removed)));
      }
    }
  });

  observer.observe(root, { [CHILD_LIST]: true, subtree: true });
  return observer;
}

/**
 * Watch for DOM mutations using a single root MutationObserver attached to document.documentElement.
 *
 * @param {Element} [_node] - Optional target node (root element preferred)
 * @returns {CleanupFunction} Function that stops observing when all watchers unregister
 */
export const watchMutations = (node?: Element): CleanupFunction => {
  if (isServer()) {
    // Do nothing in SSR
    return () => {};
  }

  const appState = getAppState();
  let state = appState.getData<MutationObserverState>(DATA_KEY_MUTATION_OBSERVERS);
  if (!state) {
    state = {
      activeObserver: null,
      watchCount: 0,
    };
    appState.setData(DATA_KEY_MUTATION_OBSERVERS, state);
  }

  state.watchCount++;

  if (!state.activeObserver) {
    const root = typeof document !== "undefined" ? document.documentElement || document.body : node;
    if (root) {
      state.activeObserver = createRootObserver(root);
    }
  }

  let cleanedUp = false;

  return () => {
    if (cleanedUp) return;
    cleanedUp = true;

    state.watchCount--;
    if (state.watchCount <= 0) {
      state.activeObserver?.disconnect();
      state.activeObserver = null;
      state.watchCount = 0;
    }
  };
};
