/**
 * Escapes special characters for use in HTML text and attributes.
 * @param {any} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeHTML = (str: any): string =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Escapes attribute values for safe inclusion in HTML.
 *
 * @param {any} value - The attribute value to escape
 * @returns {string} The escaped attribute value
 */
export const escapeAttribute = (value: any): string => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
