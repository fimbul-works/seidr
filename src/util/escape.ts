/**
 * Escapes special characters for use in HTML text and attributes.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeHTML = (str: string): string =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Escapes attribute values for safe inclusion in HTML.
 *
 * @param {string} value - The attribute value to escape
 * @returns {string} The escaped attribute value
 */
export const escapeAttribute = (value: string): string => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
