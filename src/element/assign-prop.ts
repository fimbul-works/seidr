import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { isServer } from "../util/environment/server";
import { camelToKebab } from "../util/string";
import { isSeidr } from "../util/type-guards/is-observable";
import { isEmpty, isObj, isStr } from "../util/type-guards/primitive-types";

/**
 * Assigns a property to an element, handling reactive Seidr bindings.
 *
 * @param {HTMLElement} el - The target element
 * @param {string} prop - Property name
 * @param {any} value - Property value (scalar or Seidr)
 * @param {CleanupFunction[]} cleanups - Array to store binding cleanups
 */
export const assignProp = (el: HTMLElement, prop: string, value: any, cleanups: CleanupFunction[]): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.startsWith(prefix) && prop.length > prefix.length;
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();

  let target: HTMLElement[keyof HTMLElement] = el;
  let effectiveProp = prop;
  let useAttribute = propStartsWith("aria-") || propStartsWith("data-");

  if (!useAttribute) {
    if (propStartsWith("data") && matchUpperCasePosition(4)) {
      target = el.dataset;
      effectiveProp = prop[4].toLowerCase() + prop.slice(5);
    } else if (propStartsWith("aria") && matchUpperCasePosition(4)) {
      if (!(prop in el)) {
        effectiveProp = camelToKebab(prop);
        useAttribute = true;
      }
    }
  }

  if (prop === "style") {
    const setCSSText = (cssText?: string | Seidr<string>) => {
      if (isSeidr(cssText)) {
        cleanups.push(cssText.bind(el, (val) => (el.style = val)));
      } else {
        el.style = cssText as string;
      }
    };

    const setCSSStyleProperty = <K extends keyof CSSStyleDeclaration>(style: K, value: CSSStyleDeclaration[K]) => {
      if (isServer()) {
        style = camelToKebab(style as string) as K;
      }
      if (isSeidr(value)) {
        cleanups.push(value.bind(el, (val) => (el.style[style] = val)));
      } else {
        el.style[style] = value;
      }
    };

    if (isSeidr(value)) {
      if (isStr(value.value)) {
        cleanups.push(
          value.bind(el, (val) => {
            setCSSText(val);
          }),
        );
      } else {
        cleanups.push(value.bind(el, (val) => (el.style = val)));
      }
    } else if (isStr(value)) {
      setCSSText(value);
    } else if (isObj(value)) {
      for (const [styleProp, styleValue] of Object.entries(value)) {
        setCSSStyleProperty(styleProp as keyof CSSStyleDeclaration, styleValue);
      }
    }
    return;
  }

  if (isSeidr(value)) {
    cleanups.push(
      value.bind(el, (val, _element) => {
        if (useAttribute) {
          isEmpty(val) ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(val));
        } else {
          (target as any)[effectiveProp] = val;
        }
      }),
    );
  } else {
    if (useAttribute) {
      isEmpty(value) ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(value));
    } else {
      (target as any)[effectiveProp] = value;
    }
  }
};
