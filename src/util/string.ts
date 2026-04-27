/**
 * Converts a camelCase string to kebab-case.
 *
 * @param {string} str The string to convert
 * @returns {string} The kebab-case string
 */
export const camelToKebab = (str: string): string => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
