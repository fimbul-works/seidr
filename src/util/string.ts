/**
 * Converts a camelCase string to kebab-case.
 *
 * @param {string} str The string to convert
 * @returns {string} The kebab-case string
 */
export const camelToKebab = (str: string): string => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Converts any value to a string.
 *
 * @param {any} v The value to convert
 * @returns {string} The string representation of the value
 */
export const str = (v: any): string => String(v);
