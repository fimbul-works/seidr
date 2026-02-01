/**
 * Converts a camelCase string to kebab-case.
 *
 * @param {string} str The string to convert
 * @returns {string} The kebab-case string
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param {string} str The string to convert
 * @returns {string} The camelCase string
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Checks if a string is in kebab-case.
 * A single lowercase word is considered valid kebab-case.
 * Valid: "foo", "foo-bar", "my-custom-element"
 * Invalid: "fooBar", "Foo-Bar", "foo--bar", "-foo"
 *
 * @param {string} str The string to check
 * @returns {boolean} True if the string is in kebab-case, false otherwise
 */
export function isKebabCase(str: string): boolean {
  if (/[A-Z]/.test(str)) return false;
  return /^[a-z]+(-[a-z]+)*$/.test(str);
}

/**
 * Checks if a string is in camelCase.
 * A single lowercase word is considered valid camelCase.
 * Valid: "foo", "fooBar", "myCustomElement"
 * Invalid: "FooBar", "foo-bar", "foo_bar", "1foo"
 *
 * @param {string} str The string to check
 * @returns {boolean} True if the string is in camelCase, false otherwise
 */
export function isCamelCase(str: string): boolean {
  if (/-|_/.test(str)) return false;
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}
