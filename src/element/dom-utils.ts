import { unwrapSeidr } from "../seidr";
import type { CleanupFunction } from "../types";
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
        if (isSeidr(styleValue)) {
          cleanups.push(
            styleValue.bind(el, (val, element) => {
              element.style.setProperty(styleProp, String(val));
            }),
          );
        } else {
          el.style.setProperty(styleProp, String(styleValue));
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
): void {
  const initialItem = isFn(child) ? (child as any)() : child;

  // Handle reactive child (Seidr)
  if (isSeidr(initialItem)) {
    const anchor = createElementText("");
    parent.appendChild(anchor);

    let currentNodes: Node[] = [];
    let currentComponent: any = null;

    const update = (val: any) => {
      // Cleanup previous
      if (currentComponent) {
        currentComponent.element.remove();
        currentComponent = null;
      }
      for (const node of currentNodes) {
        if ((node as any).remove) (node as any).remove();
        else if (node.parentNode) node.parentNode.removeChild(node);
      }
      currentNodes = [];

      const item = unwrapSeidr(isFn(val) ? val() : val);
      if (isEmpty(item) || isBool(item)) return;

      if (isSeidrFragment(item)) {
        const nodes = item.nodes;
        item.appendTo(parent);
        currentNodes = [item.start, ...nodes, item.end];
      } else if (isSeidrComponent(item)) {
        currentComponent = item;
        const el = item.element as any;
        if (isSeidrFragment(el)) {
          const nodes = el.nodes;
          el.appendTo(parent);
          currentNodes = [el.start, ...nodes, el.end];
        } else {
          parent.insertBefore(el, anchor);
          currentNodes = [el];
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

  if (isSeidrFragment(item)) {
    item.appendTo(parent);
  } else if (isSeidrComponent(item)) {
    const el = item.element as any;
    if (isSeidrFragment(el)) {
      el.appendTo(parent);
    } else {
      parent.appendChild(el);
    }
    if (item.scope.onAttached) item.scope.onAttached(parent);
  } else {
    parent.appendChild(isStr(item) || isNum(item) ? createElementText(item) : (item as any));
  }
}
