import { onMount } from "../component/on-mount";
import { onUnmount } from "../component/on-unmount";
import type { Seidr } from "../seidr";
import { getHydrationMap } from "../ssr/hydrate";
import { SeidrError } from "../types";
import { isServer } from "../util/environment/is-server";
import { camelToKebab } from "../util/string";
import { isSeidr } from "../util/type-guards/obserbable-types";
import { isEmpty, isObj, isStr } from "../util/type-guards/primitive-types";

/**
 * Assigns a property to an element, handling reactive Seidr bindings.
 *
 * @param {HTMLElement} el - The target element
 * @param {string} prop - Property name
 * @param {any} value - Property value (scalar or Seidr)
 */
export const assignProp = (el: HTMLElement, prop: string, value: any): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.startsWith(prefix) && prop.length > prefix.length;
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();

  // Handle ref
  if (prop === "ref") {
    if (!isSeidr<HTMLElement | null>(value)) {
      throw new SeidrError("ref must be a Seidr");
    }
    onMount(() => (value.value = el), false);
    onUnmount(() => (value.value = null), false);
    return;
  }

  const currentElement = (element: HTMLElement): any =>
    (!process.env.CORE_DISABLE_SSR && getHydrationMap().get(element)) || element;

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

  if (prop === "style") {
    const setCSSText = (cssText?: string | Seidr<string>) => {
      if (isSeidr<string>(cssText)) {
        onUnmount(
          cssText.bind(el, (val, element) => (currentElement(element).style = val)),
          false,
        );
      } else {
        el.style = cssText as string;
      }
    };

    const setCSSStyleProperty = <K extends keyof CSSStyleDeclaration>(
      styleProp: K,
      styleValue: CSSStyleDeclaration[K],
    ) => {
      if (isServer()) {
        styleProp = camelToKebab(styleProp as string) as K;
      }
      if (isSeidr<CSSStyleDeclaration[K]>(styleValue)) {
        onUnmount(
          styleValue.bind(el, (val, element) => (currentElement(element).style[styleProp] = val)),
          false,
        );
      } else {
        el.style[styleProp] = styleValue;
      }
    };

    if (isSeidr(value)) {
      if (isStr(value.value)) {
        onUnmount(
          value.bind(el, (val, element) => {
            const activeElement = currentElement(element);
            if (isSeidr<string>(val)) {
              // edgecase
              activeElement.style = val.value;
            } else {
              activeElement.style = val;
            }
          }),
          false,
        );
      } else {
        onUnmount(
          value.bind(el, (val, element) => (currentElement(element).style = val)),
          false,
        );
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

  const isBoolProp =
    /^(?:allowfullscreen|async|autofocus|autoplay|checked|compact|controls|default|defer|disabled|formnovalidate|hidden|ismap|loop|multiple|muted|nomodule|noresize|noshade|novalidate|open|playsinline|readonly|required|reversed|selected|truespeed)$/.test(
      effectiveProp.toLowerCase(),
    );

  const applyValue = (target: any, value: any) => {
    if (useAttribute || !(effectiveProp in target) || isBoolProp) {
      if (isBoolProp) {
        value ? target.setAttribute(effectiveProp, "") : target.removeAttribute(effectiveProp);
      } else {
        isEmpty(value) ? target.removeAttribute(effectiveProp) : target.setAttribute(effectiveProp, value);
      }
    }
    if (!(useAttribute || !(effectiveProp in target))) {
      target[effectiveProp] = value;
    }
  };

  if (isSeidr(value)) {
    onUnmount(
      value.bind(el, (val, element) => applyValue(currentElement(element), val)),
      false,
    );
  } else {
    applyValue(currentElement(el), value);
  }
};
