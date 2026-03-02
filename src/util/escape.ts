import { str } from "./string";

/**
 * Escapes special characters for use in HTML text and attributes.
 * @param {any} html - The string to escape
 * @returns {string} The escaped string
 */
export const escapeHTML = (html: any): string =>
  str(html)
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
export const escapeAttribute = (value: any): string => str(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
