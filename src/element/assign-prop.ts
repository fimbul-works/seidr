import { type Component, useScope } from "../component/index.js";
import { BOOL_ATTRIBUTES } from "../constants.js";
import { type Seidr, unwrapSeidr } from "../seidr/index.js";
import { SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { camelToKebab } from "../util/string.js";
import { isSeidr } from "../util/type-guards/obserbable-types.js";
import { isEmpty, isObj, isStr } from "../util/type-guards/primitive-types.js";

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

  let scope: Component | undefined;
  try {
    scope = useScope();
  } catch (_e) {
    // If we are not in a component, we can't set the ref
  }

  // Handle ref
  if (prop === "ref") {
    if (!isSeidr<HTMLElement | null>(value)) {
      throw new SeidrError("ref must be a Seidr");
    }

    scope?.onMount(() => (value.value = el));
    scope?.onUnmount(() => (value.value = null));

    return;
  }

  const currentElement = (element: HTMLElement): any => element;

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
        const cleanup = cssText.bind(el, (val, element) => (currentElement(element).style = val));
        scope?.onUnmount(cleanup);
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
        const cleanup = styleValue.bind(el, (val, element) => (currentElement(element).style[styleProp] = val));
        scope?.onUnmount(cleanup);
      } else {
        el.style[styleProp] = styleValue;
      }
    };

    if (isSeidr(value)) {
      if (isStr(value.value)) {
        const cleanup = value.bind(el, (val, element) => {
          const activeElement = currentElement(element);
          activeElement.style = unwrapSeidr(val);
        });
        scope?.onUnmount(cleanup);
      } else {
        const cleanup = value.bind(el, (val, element) => (currentElement(element).style = val));
        scope?.onUnmount(cleanup);
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

  const isBoolProp = BOOL_ATTRIBUTES.has(prop.toLowerCase());

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
    const cleanup = value.bind(el, (val, element) => applyValue(currentElement(element), val));
    scope?.onUnmount(cleanup);
  } else {
    applyValue(currentElement(el), value);
  }
};
