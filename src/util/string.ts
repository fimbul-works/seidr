/**
 * Converts a camelCase string to kebab-case.
 *
 * @param {string} str The string to convert
 * @returns {string} The kebab-case string
 */
export const camelToKebab = (str: string): string => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param {string} str The string to convert
 * @returns {string} The camelCase string
 */
export const kebabToCamel = (str: string): string => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/**
 * Checks if a string is in kebab-case.
 * A single lowercase word is considered valid kebab-case.
 * Valid: "foo", "foo-bar", "my-custom-element"
 * Invalid: "fooBar", "Foo-Bar", "foo--bar", "-foo"
 *
 * @param {string} str The string to check
 * @returns {boolean} True if the string is in kebab-case, false otherwise
 */
export const isKebabCase = (str: string): boolean => (/[A-Z]/.test(str) ? false : /^[a-z]+(-[a-z]+)*$/.test(str));

/**
 * Checks if a string is in camelCase.
 * A single lowercase word is considered valid camelCase.
 * Valid: "foo", "fooBar", "myCustomElement"
 * Invalid: "FooBar", "foo-bar", "foo_bar", "1foo"
 *
 * @param {string} str The string to check
 * @returns {boolean} True if the string is in camelCase, false otherwise
 */
export const isCamelCase = (str: string): boolean => (/-|_/.test(str) ? false : /^[a-z][a-zA-Z0-9]*$/.test(str));

/**
 * Converts any value to a string.
 *
 * @param {any} v The value to convert
 * @returns {string} The string representation of the value
 */
export const str = (v: any): string => String(v);
