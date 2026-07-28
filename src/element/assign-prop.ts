import { onMmounted, onUnmounted } from "../component-new/index.js";
import { BOOL_ATTRIBUTES } from "../constants.js";
import { type Seidr, unwrapSeidr } from "../seidr/index.js";
import { SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { camelToKebab } from "../util/string.js";
import { isSeidr } from "../util/type-guards/observable-types.js";
import { isEmpty, isObj, isStr } from "../util/type-guards/primitive-types.js";
import type { PropName } from "./types.js";

/**
 * Assigns a property to an element, handling reactive Seidr bindings.
 *
 * @template P - Name of the property
 * @param {HTMLElement} el - The target element
 * @param {string} prop - Property name
 * @param {any} value - Property value (scalar or Seidr)
 * @throws {SeidrError} if `prop` is a `ref´ but the `value` is not a Seidr instance
 */
export const assignProp = <P extends PropName = PropName>(el: HTMLElement, prop: P, value: any): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.length > prefix.length && prop.startsWith(prefix);
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();

  // Handle ref
  if (prop === "ref") {
    if (!isSeidr<HTMLElement | null>(value)) {
      throw new SeidrError("ref must be a Seidr");
    }

    onMmounted(() => (value.value = el), el);
    onUnmounted(() => (value.value = null), el);
    return;
  }

  let effectiveProp: PropName = prop;
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
        const cleanup = cssText.bind(el, (val, element) => (element.style = val));
        onUnmounted(cleanup, el);
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
        const cleanup = styleValue.bind(el, (val, element) => (element.style[styleProp] = val));
        onUnmounted(cleanup, el);
      } else {
        el.style[styleProp] = styleValue;
      }
    };

    if (isSeidr(value)) {
      if (isStr(value.value)) {
        const cleanup = value.bind(el, (val, element) => {
          element.style = unwrapSeidr(val);
        });
        onUnmounted(cleanup, el);
      } else {
        const cleanup = value.bind(el, (val, element) => (element.style = val));
        onUnmounted(cleanup, el);
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
      isEmpty(value)
        ? target.removeAttribute(effectiveProp)
        : target.setAttribute(effectiveProp, isBoolProp ? "" : value);
    }
    if (!(useAttribute || !(effectiveProp in target))) {
      target[effectiveProp] = value;
    }
  };

  if (isSeidr(value)) {
    const cleanup = value.bind(el, (val, element) => applyValue(element, val));
    onUnmounted(cleanup, el);
  } else {
    applyValue(el, value);
  }
};
