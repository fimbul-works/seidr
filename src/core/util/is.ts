import type { SeidrComponent } from "../dom";
import { Seidr } from "../seidr";

/**
 * Check if a value is undefined.
 * @param v - Value to check
 * @returns True if the value is undefined, false otherwise
 */
export const isUndef = (v: any): v is undefined => typeof v === "undefined";

/**
 * Check if a value is a boolean.
 * @param v - Value to check
 * @returns True if the value is a boolean, false otherwise
 */
export const isBool = (v: any): boolean => typeof v === "boolean";

/**
 * Check if a value is a number.
 * @param v - Value to check
 * @returns True if the value is a number, false otherwise
 */
export const isNum = (v: any): v is number => typeof v === "number";

/**
 * Check if a value is a string.
 * @param v - Value to check
 * @returns True if the value is a string, false otherwise
 */
export const isStr = (v: any): v is string => typeof v === "string";

/**
 * Check if a value is a function.
 * @param v - Value to check
 * @returns True if the value is a function, false otherwise
 */
export const isFn = (v: any): v is (...args: any[]) => any => typeof v === "function";

/**
 * Check if a value is an object.
 * @param v - Value to check
 * @returns True if the value is an object, false otherwise
 */
export const isObj = (v: any): v is object => typeof v === "object" && !Array.isArray(v) && v !== null;

/**
 * Check if a value is a Seidr class instance.
 * @param v - Value to check
 * @returns True if the value is a Seidr class instance, false otherwise
 */
export const isSeidr = (v: any): v is Seidr<any> => v instanceof Seidr;

/**
 * Check if a value is a Seidr component.
 * @param v - Value to check
 * @returns True if the value is a Seidr component, false otherwise
 */
export const isSeidrComponent = (v: any): v is SeidrComponent => v && v.isSeidrComponent === true;

/**
 * Check if a value is an HTMLElement (safely works in Node.js/SSR environments).
 * @param v - Value to check
 * @returns True if the value is an HTMLElement or its server-side equivalent
 */
export const isHTMLElement = (v: any): v is HTMLElement => {
  if (typeof HTMLElement !== "undefined" && v instanceof HTMLElement) {
    return true;
  }
  // Fallback for SSR/ServerHTMLElement which may not inherit from global HTMLElement
  return v && typeof v === "object" && "tagName" in v && "dataset" in v;
};
