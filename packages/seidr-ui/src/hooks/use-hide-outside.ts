import { isArr } from "@fimbul-works/hvat";
import {
  type CleanupFunction,
  type EffectDependency,
  getAppState,
  getDocument,
  isElementNode,
  isObservable,
  isRef,
  isServer,
  type Ref,
  unwrapValue,
  useEffect,
  type Value,
} from "@fimbul-works/seidr";

const DATA_TOP_LAYER_ATTR = "data-kb-top-layer";

export type HideOutsideTarget = Element | Ref<Element>;

export interface UseHideOutsideProps {
  /** The elements or ref(s) that should remain visible (not hidden). */
  targets: HideOutsideTarget | HideOutsideTarget[];

  /** Nothing will be hidden above this element. Defaults to document.body. */
  root?: Element | Ref<Element>;

  /** Whether the hide outside behavior is disabled or not. */
  isDisabled?: boolean | Value<boolean>;
}

interface ObserverWrapper {
  observe(): void;
  disconnect(): void;
}

const HIDE_OUTSIDE_REFCOUNT_KEY = "seidr-ui.hide-outside:ref-count";
const HIDE_OUTSIDE_STACK_KEY = "seidr-ui.hide-outside:stack";

const getRefCountMap = (): WeakMap<Element, number> =>
  getAppState().getData<WeakMap<Element, number>>(HIDE_OUTSIDE_REFCOUNT_KEY, new WeakMap());

const getObserverStack = (): Array<ObserverWrapper> =>
  getAppState().getData<Array<ObserverWrapper>>(HIDE_OUTSIDE_STACK_KEY, []);

/**
 * Hides all elements in the DOM outside the given targets from screen readers using `aria-hidden`,
 * and returns a function to revert these changes.
 */
export function ariaHideOutside(targets: Element[], root?: Element): CleanupFunction {
  if (isServer()) {
    return () => {};
  }

  const effectiveRoot = root ?? getDocument().body;
  if (!effectiveRoot) {
    return () => {};
  }

  const refCountMap = getRefCountMap();
  const observerStack = getObserverStack();

  const visibleNodes = new Set<Element>(targets);
  const hiddenNodes = new Set<Element>();

  const walk = (walkRoot: Element) => {
    // Keep top layer elements (toasts, etc.) visible
    for (const element of walkRoot.querySelectorAll(`[${DATA_TOP_LAYER_ATTR}]`)) {
      visibleNodes.add(element);
    }

    const acceptNode = (node: Element) => {
      if (
        visibleNodes.has(node) ||
        (node.parentElement && hiddenNodes.has(node.parentElement) && node.parentElement.getAttribute("role") !== "row")
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      for (const target of visibleNodes) {
        if (node.contains(target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    };

    const doc = effectiveRoot.ownerDocument ?? getDocument();
    const walker = doc.createTreeWalker(walkRoot, NodeFilter.SHOW_ELEMENT, {
      acceptNode,
    });

    const acceptRoot = acceptNode(walkRoot);
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(walkRoot);
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element | null;
      while (node != null) {
        hide(node);
        node = walker.nextNode() as Element | null;
      }
    }
  };

  const hide = (node: Element) => {
    const refCount = refCountMap.get(node) ?? 0;

    if (node.getAttribute("aria-hidden") === "true" && refCount === 0) {
      return;
    }

    if (refCount === 0) {
      node.setAttribute("aria-hidden", "true");
    }

    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  };

  if (observerStack.length > 0) {
    observerStack[observerStack.length - 1].disconnect();
  }

  walk(effectiveRoot);

  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type !== "childList" || change.addedNodes.length === 0) {
        continue;
      }

      const allNodes = [...visibleNodes, ...hiddenNodes];
      if (!allNodes.some((node) => node.contains(change.target))) {
        for (const node of change.removedNodes) {
          if (node instanceof Element) {
            visibleNodes.delete(node);
            hiddenNodes.delete(node);
          }
        }

        for (const node of change.addedNodes) {
          if (node instanceof Element) {
            walk(node);
          }
        }
      }
    }
  });

  observer.observe(effectiveRoot, { childList: true, subtree: true });

  const observerWrapper: ObserverWrapper = {
    observe() {
      observer.observe(effectiveRoot, { childList: true, subtree: true });
    },
    disconnect() {
      observer.disconnect();
    },
  };

  observerStack.push(observerWrapper);

  return () => {
    observer.disconnect();

    for (const node of hiddenNodes) {
      const count = refCountMap.get(node);
      if (count == null) continue;

      if (count === 1) {
        node.removeAttribute("aria-hidden");
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    }

    if (observerWrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop();
      if (observerStack.length > 0) {
        observerStack[observerStack.length - 1].observe();
      }
    } else {
      const idx = observerStack.indexOf(observerWrapper);
      if (idx !== -1) {
        observerStack.splice(idx, 1);
      }
    }
  };
}

function extractElements(targets: HideOutsideTarget[]): Element[] {
  const walk = (item: HideOutsideTarget): Element[] => {
    if (isRef(item)) {
      const val = item();
      if (isArr<HideOutsideTarget>(val)) {
        return extractElements(val);
      } else {
        return walk(val);
      }
    }
    return isElementNode(item) ? [item] : [];
  };
  return targets.flatMap(walk);
}

const extractRoot = (root?: Element | Ref<Element>): Element | undefined => {
  if (isRef(root)) {
    const val = root();
    return isElementNode(val) ? val : undefined;
  }
  return isElementNode(root) ? root : undefined;
};

/**
 * Hides all elements in the DOM outside the given targets from screen readers using aria-hidden.
 * Reverts changes automatically on unmount.
 *
 * Ported from Kobalte's createHideOutside primitive.
 *
 * @param props - The properties for the hook.
 */
export function useHideOutside({ isDisabled, root, targets }: UseHideOutsideProps): void {
  const items = isArr(targets) ? targets : [targets];
  const deps = [isDisabled, root, items].filter(isObservable) as EffectDependency[];

  useEffect(() => {
    if (unwrapValue(isDisabled)) {
      return;
    }

    const targets = extractElements(items);
    if (targets.length === 0) {
      return;
    }

    return ariaHideOutside(targets, extractRoot(root));
  }, deps);
}
