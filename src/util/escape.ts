/**
 * Escapes special characters for use in HTML text and attributes.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHTML(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes attribute values for safe inclusion in HTML.
 *
 * @param {string} value - The attribute value to escape
 * @returns {string} The escaped attribute value
 */
export function escapeAttribute(value: string): string {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
