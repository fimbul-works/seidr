import { getAppState } from "../app-state/app-state.js";
import { onMounted, onUnmounted } from "../component/lifecycle/index.js";
import { BOOL_ATTRIBUTES } from "../constants.js";
import { isValue } from "../observable/type-guards.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { camelToKebab } from "../util/string.js";
import { isNullish, isObj, isStr } from "../util/type-guards.js";
import type { PropName, SeidrElementProps } from "./types.js";

// Data-key for element prop bindingss
const ELEMENT_BINDINGS_DATA_KEY = "seidr.bindings";

/**
 * Interface for a reactive binding.
 */
interface PropBinding {
  /**
   * The reactive value.
   */
  value: unknown;
  /**
   * Cleanup function.
   */
  cleanup?: CleanupFunction;
}

/**
 * Returns the bindings for a given element, or creates them if they don't exist.
 * Maps: Node -> (PropKey -> PropBinding)
 * @param {Node} el - The element to get the bindings for.
 * @returns {Map<string, PropBinding>} The bindings for the given element.
 */
function getElementBindings(el: Node): Map<string, PropBinding> {
  const appState = getAppState();
  if (!appState.hasData(ELEMENT_BINDINGS_DATA_KEY)) {
    appState.setData(ELEMENT_BINDINGS_DATA_KEY, new WeakMap<Node, Map<string, PropBinding>>());
  }
  const propBindings = appState.getData<WeakMap<Node, Map<string, PropBinding>>>(ELEMENT_BINDINGS_DATA_KEY)!;
  let bindings = propBindings.get(el);
  if (!bindings) {
    bindings = new Map<string, PropBinding>();
    propBindings.set(el, bindings);
  }
  return bindings;
}

/**
 * Cleans up and registers a reactive binding for an element prop.
 *
 * @param {HTMLElement} el - The element to register the binding for.
 * @param {string} bindingKey - The key of the binding.
 * @param {any} newValue - The new value to bind.
 * @param {(val: any) => void} applyFn - The function to apply the value to.
 */
function setPropBinding(el: HTMLElement, bindingKey: string, newValue: any, applyFn: (val: any) => void): void {
  const bindings = getElementBindings(el);
  const existing = bindings.get(bindingKey);

  // If identical Value or identical primitive already bound, do nothing
  if (existing && existing.value === newValue) {
    return;
  }

  // Clean up previous binding if different
  if (existing?.cleanup) {
    existing.cleanup();
    bindings.delete(bindingKey);
  }

  if (isValue(newValue)) {
    const cleanup = newValue.bind((val) => applyFn(unwrapValue(val)));
    bindings.set(bindingKey, { value: newValue, cleanup });
    onUnmounted(() => {
      const current = bindings.get(bindingKey);
      if (current && current.value === newValue) {
        current.cleanup?.();
        bindings.delete(bindingKey);
      }
    }, el);
  } else {
    bindings.delete(bindingKey);
    applyFn(newValue);
  }
}

/**
 * Assigns a property to an element, handling reactive Value bindings.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {string & PropName<K> & keyof E} P - The property name
 * @param {E} el - The HTMLElement to assign properties to
 * @param {P} prop - The property name to assign
 * @param {E[P]} value - The property value (scalar or Seidr)
 * @throws {SeidrError} if `prop` is a `ref` but the `value` is not a Seidr instance
 */
export const assignProp = <K extends keyof HTMLElementTagNameMap, P extends SeidrElementProps<K> & string>(
  el: HTMLElementTagNameMap[K],
  prop: P | string,
  value: any,
): void => {
  // Helper functions
  const propStartsWith = (prefix: string) => prop.length > prefix.length && prop.startsWith(prefix);
  const matchUpperCasePosition = (position: number) => prop[position] === prop[position].toUpperCase();

  // Handle ref
  if (prop === "ref") {
    if (!isValue<Element | null>(value)) {
      throw new SeidrError("ref must be a Value");
    }

    const bindings = getElementBindings(el);
    const existing = bindings.get("ref");
    if (existing && existing.value === value) {
      return;
    }
    if (existing?.cleanup) {
      existing.cleanup();
    }

    bindings.set("ref", { value });
    onMounted(() => value(el), el);
    onUnmounted(() => value(null), el);
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
    const bindings = getElementBindings(el);

    const clearStyleSubBindings = () => {
      for (const [key, binding] of Array.from(bindings.entries())) {
        if (key.startsWith("style:")) {
          binding.cleanup?.();
          bindings.delete(key);
        }
      }
    };

    if (isValue(value)) {
      clearStyleSubBindings();
      setPropBinding(el, "style:cssText", value, (val) => {
        el.style = unwrapValue(val);
      });
    } else if (isStr(value)) {
      clearStyleSubBindings();
      setPropBinding(el, "style:cssText", value, (val) => {
        el.style = val as string;
      });
    } else if (isObj(value)) {
      const existingCssText = bindings.get("style:cssText");
      if (existingCssText) {
        existingCssText.cleanup?.();
        bindings.delete("style:cssText");
      }

      for (let [styleProp, styleValue] of Object.entries(value)) {
        if (isServer()) {
          styleProp = camelToKebab(styleProp);
        }
        const styleKey = `style:${styleProp}`;
        setPropBinding(el, styleKey, styleValue, (val) => {
          el.style[styleProp as any] = unwrapValue(val);
        });
      }
    }
    return;
  }

  const isBoolProp = BOOL_ATTRIBUTES.has(prop.toLowerCase());

  const applyValue = (target: HTMLElementTagNameMap[K], val: any) => {
    if (useAttribute || !(effectiveProp in target) || isBoolProp) {
      isNullish(val) || (isBoolProp && !val)
        ? target.removeAttribute(effectiveProp)
        : target.setAttribute(effectiveProp, isBoolProp ? "" : val);
    }

    if (!(useAttribute || !(effectiveProp in target))) {
      target[effectiveProp as keyof HTMLElementTagNameMap[K]] = val;
    }
  };

  setPropBinding(el, effectiveProp as string, value, (val) => applyValue(el, val));
};
