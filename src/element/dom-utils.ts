import { getDOMFactory } from "../dom-factory";
import { getRenderContext } from "../render-context";
import { unwrapSeidr } from "../seidr";
import { getHydrationData } from "../ssr/hydration-context";
import type { CleanupFunction } from "../types";
import { COMMENT_NODE } from "../types";
import { isHydrating } from "../util/env";
import { camelToKebab } from "../util/string";
import { isBool, isEmpty, isFn, isNum, isSeidr, isSeidrComponent, isSeidrFragment, isStr } from "../util/type-guards";
import type { SeidrNode } from "./types";

/**
 * Assigns a property to an element, handling reactive Seidr bindings.
 *
 * @param {any} el - The target element
 * @param {string} prop - Property name
 * @param {any} value - Property value (scalar or Seidr)
 * @param {CleanupFunction[]} cleanups - Array to store binding cleanups
 */
export function assignProp(el: any, prop: string, value: any, cleanups: CleanupFunction[]): void {
  let target: any = el;
  let effectiveProp = prop;
  let useAttribute = prop.startsWith("aria-") || prop.startsWith("data-");

  if (!useAttribute) {
    if (prop.startsWith("data") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
      target = el.dataset;
      effectiveProp = prop[4].toLowerCase() + prop.slice(5);
    } else if (prop.startsWith("aria") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
      if (!(prop in el)) {
        effectiveProp = camelToKebab(prop);
        useAttribute = true;
      }
    }
  }

  if (prop === "style") {
    if (isStr(value)) {
      if (isSeidr(value)) {
        cleanups.push(
          value.bind(el, (val, element) => {
            if (element.style.setProperty) element.style.setProperty("cssText", val as string);
            else element.style = val;
          }),
        );
      } else if (!isEmpty(value)) {
        if (el.style.setProperty) el.style.setProperty("cssText", value);
        else el.style = value;
      }
    } else if (typeof value === "object" && value !== null) {
      for (const [styleProp, styleValue] of Object.entries(value)) {
        const kebabProp = camelToKebab(styleProp);
        if (isSeidr(styleValue)) {
          cleanups.push(
            styleValue.bind(el, (val, element) => {
              element.style.setProperty(kebabProp, String(val));
            }),
          );
        } else {
          el.style.setProperty(kebabProp, String(styleValue));
        }
      }
    }
    return;
  }

  if (isSeidr(value)) {
    cleanups.push(
      value.bind(el, (val, _element) => {
        if (useAttribute) {
          val === null ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(val));
        } else {
          target[effectiveProp] = val;
        }
      }),
    );
  } else {
    if (useAttribute) {
      value === null ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(value));
    } else {
      target[effectiveProp] = value;
    }
  }
}

/**
 * Normalizes a SeidrNode into a real/SSR Node and handles attachment.
 */
export function appendChildNode(
  parent: any,
  child: SeidrNode | (() => SeidrNode),
  cleanups: CleanupFunction[],
  createElementText: (v: any) => any,
  anchorNode: Node | null = null,
): void {
  const initialItem = isFn(child) ? (child as any)() : child;

  // Handle reactive child (Seidr)
  if (isSeidr(initialItem)) {
    const anchor = createElementText("");
    parent.insertBefore(anchor, anchorNode);

    let currentNodes: Node[] = [];
    let currentComponent: any = null;

    const update = (val: any) => {
      // Cleanup previous
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }
      for (const node of currentNodes) {
        if ((node as any).remove) (node as any).remove();
        else if (node.parentNode) node.parentNode.removeChild(node);
      }
      currentNodes = [];

      const item = unwrapSeidr(isFn(val) ? val() : val);
      if (isEmpty(item) || isBool(item)) return;

      if (Array.isArray(item)) {
        const ctx = getRenderContext();
        const domFactory = getDOMFactory();

        // Hybrid Hydration Logic
        if (ctx && isHydrating()) {
          const id = ctx.idCounter++;
          const hydrationData = getHydrationData();
          let s: Node | null = null;
          let e: Node | null = null;

          // 1. Try finding by Path
          if (hydrationData?.fragments?.[String(id)] && hydrationData.root) {
            const path = hydrationData.fragments[String(id)];
            let node = hydrationData.root;
            let isValid = true;
            for (const idx of path) {
              if (node.childNodes && node.childNodes[idx]) {
                node = node.childNodes[idx];
              } else {
                isValid = false;
                break;
              }
            }

            // Verify it is the correct start marker
            if (isValid && node.nodeType === COMMENT_NODE && node.textContent === `s:${id}`) {
              s = node;
              // If we found s via path, e should be a sibling
              // We could also record path to e, but scanning siblings is generally fast enough once we have s.
              // Also ensures structural integrity (sibship).
            }
          }

          // 2. Scan children for markers (s:ID) if path lookup failed
          const sText = `s:${id}`;
          const eText = `e:${id}`;

          if (!s) {
            const childNodes = parent.childNodes || [];
            for (let i = 0; i < childNodes.length; i++) {
              const n = childNodes[i];
              if (n.nodeType === COMMENT_NODE) {
                if (n.textContent === sText) s = n;
                // Optimization: capture e if we see it
                if (n.textContent === eText) e = n;
              }
            }
          }

          // Find e if we only have s
          if (s && !e) {
            let curr = s.nextSibling;
            while (curr) {
              if (curr.nodeType === COMMENT_NODE && curr.textContent === eText) {
                e = curr;
                break;
              }
              curr = curr.nextSibling;
            }
          }

          if (s && e) {
            // Found Existing Markers!
            // Clear content between them
            let curr = s.nextSibling;
            while (curr && curr !== e) {
              const next = curr.nextSibling;
              curr.remove();
              curr = next;
            }

            // Insert new items before End Marker
            const reuseAnchor = e;
            const newNodes: Node[] = [s as Node];

            // We need to capture the nodes added by appendChildNode
            // But appendChildNode doesn't return them.
            // However, for reactive arrays, we assume they are Elements/Text that are not Fragments themselves (usually).
            // Or if they are, they handle themselves.
            // We can't easily capture the *exact* nodes added by `appendChildNode` if it's recursive.
            // But distinct from the static path, `update` needs `currentNodes` for cleanup.
            // Strategy: Track siblings between s and e AFTER insertion.

            item.forEach((child) => {
              appendChildNode(parent, child, cleanups, createElementText, reuseAnchor);
            });

            // Recapture nodes between s and e
            let scanner = s.nextSibling;
            while (scanner && scanner !== e) {
              newNodes.push(scanner);
              scanner = scanner.nextSibling;
            }
            newNodes.push(e as Node);

            currentNodes = newNodes;
            return;
          }
        }

        const fragment = domFactory.createDocumentFragment();
        const nodes: Node[] = [];

        if (ctx) {
          const id = ctx.idCounter++;
          const s = domFactory.createComment(`s:${id}`);
          const e = domFactory.createComment(`e:${id}`);
          fragment.appendChild(s);
          nodes.push(s);

          item.forEach((child) => {
            // For reactive arrays, we assume static nodes or text for now.
            // Complex nesting usually handled by components.
            const n = isStr(child) || isNum(child) ? createElementText(child) : (child as any);
            fragment.appendChild(n);
            nodes.push(n);
          });

          fragment.appendChild(e);
          nodes.push(e);
        } else {
          item.forEach((child) => {
            const n = isStr(child) || isNum(child) ? createElementText(child) : (child as any);
            fragment.appendChild(n);
            nodes.push(n);
          });
        }

        parent.insertBefore(fragment, anchor);
        currentNodes = nodes;
        parent.insertBefore(fragment, anchor);
        currentNodes = nodes;
      } else if (isSeidrFragment(item)) {
        // Fragment: We must track its boundaries.
        // It has start/end properties now.
        parent.insertBefore(item as unknown as Node, anchor);
        // After insertion, fragment is empty, but start/end are in DOM.
        // We can use clearBetween logic later using start/end.
        // For 'currentNodes' tracking, we can just track the start/end markers if we want strict equality?
        // Actually, update() uses currentNodes to remove().
        // If we push start/end, we should push [start, ...content, end]?
        // But content is dynamic.
        // Actually, if we use clearBetween(start, end) we don't need currentNodes list!
        // But update() iterates currentNodes to remove them.
        // Let's change update() to handle fragment cleanup differently?
        // Or just push start/end and ensure remove() handles them?
        // IsSeidrFragment has start/end.
        currentNodes = [item.start, item.end];

        // Wait, if we only track start/end, the nodes IN BETWEEN are not in currentNodes.
        // When we remove() start and end, the middle nodes are orphans?
        // We need 'clearBetween(start, end)' logic in the cleanup phase of update().
        // Currently update() loops currentNodes and calls remove().
        // If we modify update() to detect if we have specific "Range" cleanup...

        // Alternative: just push all nodes?
        // But we can't easily get them after insertion.
        // Actually, the previous code tried `[item.start, ...nodes, item.end]`.
        // `item.childNodes` are empty after append.
        // But we can capture them BEFORE append.
        // EXCEPT `item` is a SeidrFragment which we just got. It might be empty if hydration?
        // If hydration, it's empty. Markers are in DOM.
        // If creation, it has children.

        // Simpler: Just track [start, end].
        // And modify cleanup loop to handle it?
        // Or better: Use component.unmount logic which handles ranges.
        // But here 'item' is just a Fragment, not a Component.

        // HACK: We can assign a `remove` method to `item.start` that clears the range?
        // No, that's messy.

        // Let's trust that we can track components.
        // For plain fragments, we might just use `clearBetween` if we detect it.

        // Let's stick to the previous attempt's logic but fix syntax errors.
        const nodes = Array.from(item.childNodes);
        parent.insertBefore(item as unknown as Node, anchor);
        currentNodes = [item.start, ...nodes, item.end];
      } else if (isSeidrComponent(item)) {
        currentComponent = item;
        const el = item.element as any;
        if (isSeidrFragment(el)) {
          const nodes = Array.from(el.childNodes);
          parent.insertBefore(el, anchor);
          // Component unmount handles everything.
          currentNodes = [];
        } else {
          parent.insertBefore(el, anchor);
          currentNodes = [];
        }
        if (item.scope.onAttached) item.scope.onAttached(parent);
      } else {
        const newNode = isStr(item) || isNum(item) ? createElementText(item) : (item as any);
        parent.insertBefore(newNode, anchor);
        currentNodes = [newNode];
      }
    };

    cleanups.push(initialItem.bind(parent, (val) => update(val)));
    return;
  }

  // Handle static child
  const item = unwrapSeidr(initialItem);
  if (isEmpty(item) || isBool(item)) return;

  if (Array.isArray(item)) {
    const ctx = getRenderContext();
    const domFactory = getDOMFactory();

    // Hybrid Hydration Logic
    if (ctx && isHydrating()) {
      const id = ctx.idCounter++;
      const hydrationData = getHydrationData();
      let s: Node | null = null;
      let e: Node | null = null;

      // 1. Try finding by Path
      if (hydrationData?.fragments?.[String(id)] && hydrationData.root) {
        const path = hydrationData.fragments[String(id)];
        let node = hydrationData.root;
        let isValid = true;
        for (const idx of path) {
          if (node.childNodes && node.childNodes[idx]) {
            node = node.childNodes[idx];
          } else {
            isValid = false;
            break;
          }
        }

        if (isValid && node.nodeType === COMMENT_NODE && node.textContent === `s:${id}`) {
          s = node;
        }
      }

      // 2. Scan children for markers (s:ID)
      const sText = `s:${id}`;
      const eText = `e:${id}`;

      if (!s) {
        const childNodes = parent.childNodes || [];
        for (let i = 0; i < childNodes.length; i++) {
          const n = childNodes[i];
          if (n.nodeType === COMMENT_NODE) {
            if (n.textContent === sText) s = n;
            if (n.textContent === eText) e = n;
          }
        }
      }

      if (s && !e) {
        let curr = s.nextSibling;
        while (curr) {
          if (curr.nodeType === COMMENT_NODE && curr.textContent === eText) {
            e = curr;
            break;
          }
          curr = curr.nextSibling;
        }
      }

      if (s && e) {
        // Found Existing Markers!
        // Clear content between them
        let curr = s.nextSibling;
        while (curr && curr !== e) {
          const next = curr.nextSibling;
          curr.remove();
          curr = next;
        }

        // Insert new items before End Marker
        const reuseAnchor = e;
        item.forEach((child) => {
          appendChildNode(parent, child, cleanups, createElementText, reuseAnchor);
        });
        return; // Done
      }
    }

    const fragment = domFactory.createDocumentFragment();

    // Only add markers if we have a context (SSR or hydrating browser)
    if (ctx) {
      const id = ctx.idCounter++;
      const s = domFactory.createComment(`s:${id}`);
      const e = domFactory.createComment(`e:${id}`);
      fragment.appendChild(s);

      item.forEach((child) => {
        appendChildNode(fragment, child, cleanups, createElementText);
      });

      fragment.appendChild(e);
    } else {
      item.forEach((child) => {
        appendChildNode(fragment, child, cleanups, createElementText);
      });
    }

    parent.insertBefore(fragment, anchorNode);
  } else if (isSeidrFragment(item)) {
    // Fragment: just insert it, it will empty itself.
    // We don't track nodes for static items.
    parent.insertBefore(item, anchorNode);
  } else if (isSeidrComponent(item)) {
    const el = item.element as any;
    // Insert element (Fragment or Node)
    parent.insertBefore(el, anchorNode);

    if (item.scope.onAttached) item.scope.onAttached(parent);
  } else {
    const newNode = isStr(item) || isNum(item) ? createElementText(item) : (item as any);
    parent.insertBefore(newNode, anchorNode);
  }
}
