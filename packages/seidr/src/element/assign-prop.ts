import { isNullish, isObj, isStr } from "@fimbul-works/hvat";
import { BOOL_ATTRIBUTES } from "../constants.js";
import { onMounted, onUnmounted } from "../hooks/index.js";
import { isRef, isValue } from "../observable/type-guards.js";
import { SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { camelToKebab } from "../util/string.js";
import type { PropName, SeidrElementProps, SeidrElementTagNameMap } from "./types.js";

/**
 * Assigns a property to an element, handling reactive Value bindings.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {string & PropName<K> & keyof E} P - Property name type
 * @param {E} el - Element to assign properties to
 * @param {P} prop - Property name to assign
 * @param {E[P]} value - Property value (scalar or Seidr)
 * @throws {SeidrError} if `prop` is a `ref` but the `value` is not a valid Ref instance
 */
export const assignProp = <K extends keyof SeidrElementTagNameMap, P extends SeidrElementProps<K> & string>(
  el: SeidrElementTagNameMap[K],
  prop: P | string,
  value: any,
): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.length > prefix.length && prop.startsWith(prefix);
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();

  // Handle ref
  if (prop === "ref") {
    if (!isRef(value)) {
      throw new SeidrError("Invalid ref");
    }

    onMounted(() => value(el));
    onUnmounted(() => value(null));
    return;
  }

  let effectiveProp: PropName<any> = prop;
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
    if (isValue(value)) {
      onUnmounted(value.bind((style) => (el.style = style)));
    } else if (isStr(value)) {
      el.style = value;
    } else if (isObj(value)) {
      for (let [styleProp, styleValue] of Object.entries(value)) {
        if (isServer()) {
          styleProp = camelToKebab(styleProp);
        }
        if (isValue(styleValue)) {
          onUnmounted(styleValue.bind((val) => (el.style[styleProp as any] = val)));
        } else {
          el.style[styleProp as any] = styleValue;
        }
      }
    }
    return;
  }

  const isBoolProp = BOOL_ATTRIBUTES.has(prop.toLowerCase());

  const applyValue = (target: SeidrElementTagNameMap[K], val: any) => {
    if (useAttribute || !(effectiveProp in target) || isBoolProp) {
      isNullish(val) || (isBoolProp && !val)
        ? target.removeAttribute(effectiveProp)
        : target.setAttribute(effectiveProp, isBoolProp ? "" : val);
    }

    if (!(useAttribute || !(effectiveProp in target))) {
      target[effectiveProp as keyof SeidrElementTagNameMap[K]] = val;
    }
  };

  if (isValue(value)) {
    onUnmounted(value.bind((val) => applyValue(el, val)));
  } else {
    applyValue(el, value);
  }
};
