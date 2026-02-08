/**
 * Check if a value is an array.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an array, `false` otherwise
 */
export const isArray = <T extends any[]>(v: any): v is T => Array.isArray(v);

/**
 * Check if a value is a boolean.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a boolean, `false` otherwise
 */
export const isBool = (v: any): v is boolean => typeof v === "boolean";

/**
 * Check if a value is empty (`null`, or `undefined`).
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is empty, `false` otherwise
 */
export const isEmpty = (v: any): v is null | undefined => v === null || typeof v === "undefined";

/**
 * Check if a value is a function.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a function, `false` otherwise
 */
export const isFn = <T extends (...args: any[]) => any>(v: any): v is T => typeof v === "function";

/**
 * Check if a value is a number.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a number, `false` otherwise
 */
export const isNum = (v: any): v is number => typeof v === "number";

/**
 * Check if a value is an object.
 * @template {object} T - Type of the object
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is an object, `false` otherwise
 */
export const isObj = <T extends object>(v: any): v is T => v !== null && typeof v === "object" && !isArray(v);

/**
 * Check if a value is a string.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a string, `false` otherwise
 */
export const isStr = (v: any): v is string => typeof v === "string";

/**
 * Check if a value is undefined.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is undefined, `false` otherwise
 */
export const isUndefined = (v: any): v is undefined => typeof v === "undefined";
