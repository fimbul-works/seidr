import { isHTMLElement } from "../../util/type-guards/dom-node-types";

interface ElementState {
  value?: string;
  checked?: boolean;
  focused?: boolean;
  scrollTop?: number;
  scrollLeft?: number;
}

type TreeState = Record<string, ElementState>;

/**
 * Generates a stable path key for a node relative to a root.
 * Format: "root:0.1.0"
 */
function getNodePath(node: Node, root: Node): string {
  if (node === root) return "root";
  const path: number[] = [];
  let current: Node | null = node;
  while (current && current !== root) {
    const parent = current.parentNode as ParentNode;
    if (!parent) break;
    const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
    path.unshift(index);
    current = parent;
  }
  return `root:${path.join(".")}`;
}

/**
 * Captures state from a DOM tree that should be preserved across replacements.
 */
export function captureTreeState(root: HTMLElement): TreeState {
  const state: TreeState = {};
  const activeElement = document.activeElement;

  const traverse = (node: Node) => {
    if (isHTMLElement(node)) {
      const el = node as HTMLElement;
      const path = getNodePath(el, root);

      const elState: ElementState = {};
      let hasState = false;

      if ("value" in el) {
        elState.value = (el as HTMLInputElement).value;
        hasState = true;
      }
      if ("checked" in el) {
        elState.checked = (el as HTMLInputElement).checked;
        hasState = true;
      }
      if (el.scrollTop !== 0 || el.scrollLeft !== 0) {
        elState.scrollTop = el.scrollTop;
        elState.scrollLeft = el.scrollLeft;
        hasState = true;
      }
      if (el === activeElement) {
        elState.focused = true;
        hasState = true;
      }

      if (hasState) {
        state[path] = elState;
      }

      el.childNodes.forEach(traverse);
    }
  };

  traverse(root);
  return state;
}

/**
 * Applies captured state to a new DOM tree.
 */
export function applyTreeState(root: HTMLElement, state: TreeState): void {
  Object.entries(state).forEach(([path, elState]) => {
    let target: Node | null = root;
    if (path !== "root") {
      const indices = path.replace("root:", "").split(".").map(Number);
      for (const index of indices) {
        if (target?.childNodes[index]) {
          target = target.childNodes[index];
        } else {
          target = null;
          break;
        }
      }
    }

    if (target && isHTMLElement(target)) {
      const el = target as HTMLElement;
      if (elState.value !== undefined) (el as HTMLInputElement).value = elState.value;
      if (elState.checked !== undefined) (el as HTMLInputElement).checked = elState.checked;
      if (elState.scrollTop !== undefined) el.scrollTop = elState.scrollTop;
      if (elState.scrollLeft !== undefined) el.scrollLeft = elState.scrollLeft;
      if (elState.focused) {
        // Use a microtask to ensure focus is applied after DOM is stable
        queueMicrotask(() => el.focus());
      }
    }
  });
}

/**
 * Replaces a node while preserving its state and the state of its children.
 * This is used for hydration mismatch recovery.
 */
export function replaceWithStateTransfer(oldNode: Node, newNode: Node): void {
  if (isHTMLElement(oldNode) && isHTMLElement(newNode)) {
    const state = captureTreeState(oldNode as HTMLElement);
    // Debug hook for tests
    if ((globalThis as any).__TEST_STATES_ENABLED__) {
      (globalThis as any).__TEST_STATES__ = state;
    }

    if (oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
      applyTreeState(newNode as HTMLElement, state);
    }
  } else if (oldNode.parentNode) {
    oldNode.parentNode.replaceChild(newNode, oldNode);
  }
}
