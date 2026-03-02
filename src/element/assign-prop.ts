import { useScope } from "../component/use-scope";
import type { Seidr } from "../seidr";
import { hydrationMap } from "../ssr/hydrate/node-map";
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
 */
export const assignProp = (el: HTMLElement, prop: string, value: any): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.startsWith(prefix) && prop.length > prefix.length;
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();
  const scope = useScope();

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
      if (isSeidr<string>(cssText)) {
        scope.onUnmount(
          cssText.bind(
            el,
            (val, element) =>
              ((((!process.env.CORE_DISABLE_SSR && hydrationMap.get(element)) || element) as HTMLElement).style = val),
          ),
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
        scope.onUnmount(
          styleValue.bind(
            el,
            (val, element) =>
              ((((!process.env.CORE_DISABLE_SSR && hydrationMap.get(element)) || element) as HTMLElement).style[
                styleProp
              ] = val),
          ),
        );
      } else {
        el.style[styleProp] = styleValue;
      }
    };

    if (isSeidr(value)) {
      if (isStr(value.value)) {
        scope.onUnmount(
          value.bind(el, (val, element) => {
            const activeElement = ((!process.env.CORE_DISABLE_SSR && hydrationMap.get(element)) ||
              element) as HTMLElement;
            if (isSeidr<string>(val)) {
              // edgecase
              activeElement.style = val.value;
            } else {
              activeElement.style = val;
            }
          }),
        );
      } else {
        scope.onUnmount(
          value.bind(
            el,
            (val, element) =>
              ((((!process.env.CORE_DISABLE_SSR && hydrationMap.get(element)) || element) as HTMLElement).style = val),
          ),
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

  const isBoolProp = BOOL_PROPS.has(effectiveProp.toLowerCase());

  if (isSeidr(value)) {
    scope.onUnmount(
      value.bind(el, (val, element) => {
        const activeElement = ((!process.env.CORE_DISABLE_SSR && hydrationMap.get(element)) || element) as any;
        if (useAttribute || !(effectiveProp in activeElement) || isBoolProp) {
          if (isBoolProp) {
            val ? activeElement.setAttribute(effectiveProp, "") : activeElement.removeAttribute(effectiveProp);
          } else {
            isEmpty(val)
              ? activeElement.removeAttribute(effectiveProp)
              : activeElement.setAttribute(effectiveProp, val);
          }
        }
        if (!(useAttribute || !(effectiveProp in activeElement))) {
          activeElement[effectiveProp] = val;
        }
      }),
    );
  } else {
    if (useAttribute || !(effectiveProp in target) || isBoolProp) {
      if (isBoolProp) {
        value ? el.setAttribute(effectiveProp, "") : el.removeAttribute(effectiveProp);
      } else {
        isEmpty(value) ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, value);
      }
    }
    if (!(useAttribute || !(effectiveProp in target))) {
      target[effectiveProp] = value;
    }
  }
};
