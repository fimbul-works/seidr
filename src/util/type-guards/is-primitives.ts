/**
 * Check if a value is is empty: `undefined` or `null`.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is `undefined` or `null`, `false` otherwise
 */
export const isEmpty = <T>(v: any): v is typeof v extends undefined ? undefined : T extends null ? null : T =>
  v === undefined || v === null;

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
