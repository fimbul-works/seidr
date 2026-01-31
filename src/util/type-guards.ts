import type { SeidrComponent, SeidrComponentFactory } from "../component/types";
import type { SeidrElement } from "../element/types";
import { Seidr } from "../seidr/seidr";

/**
 * Check if a value is undefined.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is undefined, `false` otherwise
 */
export const isUndefined = (v: any): v is undefined => typeof v === "undefined";

/**
 * Check if a value is a boolean.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a boolean, `false` otherwise
 */
export const isBool = (v: any): v is boolean => typeof v === "boolean";

/**
 * Check if a value is a number.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a number, `false` otherwise
 */
export const isNum = (v: any): v is number => typeof v === "number";

/**
 * Check if a value is a string.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a string, `false` otherwise
 */
export const isStr = (v: any): v is string => typeof v === "string";

/**
 * Check if a value is a function.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a function, `false` otherwise
 */
export const isFn = (v: any): v is (...args: any[]) => any => typeof v === "function";

/**
 * Check if a value is an object.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an object, `false` otherwise
 */
export const isObj = (v: any): v is object => typeof v === "object" && !Array.isArray(v) && v !== null;

/**
 * Check if a value is a Seidr class instance.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr class instance, `false` otherwise
 */
export const isSeidr = <T = any>(v: any): v is Seidr<T> => v instanceof Seidr;

/**
 * Check if a value is a SeidrElement extending HTMLElement.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a SeidrElement, `false` otherwise
 */
export const isSeidrElement = (v: any): v is SeidrElement => v && v.isSeidrElement === true;

/**
 * Check if a value is a Seidr component.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component, `false` otherwise
 */
export const isSeidrComponent = (v: any): v is SeidrComponent => v && v.isSeidrComponent === true;

/**
 * Check if a value is a Seidr component factory.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component factory, `false` otherwise
 */
export const isSeidrComponentFactory = <P>(v: any): v is SeidrComponentFactory<P> => v && v.isComponentFactory === true;

/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an HTMLElement or its server-side equivalent, `false` otherwise
 */
export const isHTMLElement = (v: any): v is HTMLElement => {
  if (typeof HTMLElement !== "undefined" && v instanceof HTMLElement) {
    return true;
  }
  // Fallback for SSR/ServerHTMLElement which may not inherit from global HTMLElement
  return isObj(v) && "tagName" in v && "dataset" in v;
};
