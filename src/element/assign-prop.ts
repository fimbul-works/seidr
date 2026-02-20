import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { isServer } from "../util/environment/server";
import { camelToKebab } from "../util/string";
import { isSeidr } from "../util/type-guards/is-observable";
import { isEmpty, isObj, isStr } from "../util/type-guards/primitive-types";

const BOOL_PROPS = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "compact",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "noresize",
  "noshade",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "truespeed",
]);

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

  let effectiveProp = prop;
  let useAttribute = propStartsWith("aria-") || propStartsWith("data-") || ["form", "value"].includes(prop);

  if (!useAttribute) {
    if (propStartsWith("data") && matchUpperCasePosition(4)) {
      effectiveProp = camelToKebab(prop);
      useAttribute = true;
    } else if (propStartsWith("aria") && matchUpperCasePosition(4)) {
      if (!(prop in el)) {
        effectiveProp = camelToKebab(prop);
        useAttribute = true;
      }
    } else if (prop === "htmlFor") {
      effectiveProp = "for";
      useAttribute = true;
    } else if (prop === "className") {
      effectiveProp = "class";
      useAttribute = true;
    }
  }

  const target: any = el;

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

  const isBoolProp = BOOL_PROPS.has(effectiveProp.toLowerCase());

  if (isSeidr(value)) {
    cleanups.push(
      value.bind(el, (val, _element) => {
        if (useAttribute || !(effectiveProp in target) || isBoolProp) {
          if (isBoolProp) {
            val ? el.setAttribute(effectiveProp, "") : el.removeAttribute(effectiveProp);
          } else {
            isEmpty(val) ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(val));
          }
        }
        if (!(useAttribute || !(effectiveProp in target))) {
          (target as any)[effectiveProp] = val;
        }
      }),
    );
  } else {
    if (useAttribute || !(effectiveProp in target) || isBoolProp) {
      if (isBoolProp) {
        value ? el.setAttribute(effectiveProp, "") : el.removeAttribute(effectiveProp);
      } else {
        isEmpty(value) ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(value));
      }
    }
    if (!(useAttribute || !(effectiveProp in target))) {
      (target as any)[effectiveProp] = value;
    }
  }
};
