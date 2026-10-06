/**
 * Converts a kebab-case string to camelCase.
 *
 * @param {string} str The string to convert
 * @returns {string} The camelCase string
 */
export const kebabToCamel = (str: string): string => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
